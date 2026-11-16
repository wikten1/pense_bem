import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  acknowledgeReview,
  applyAnswer,
  buildQuiz,
  createSession,
  goToNext,
  notaDesafio,
  programIdByNumber,
  redeemPassword,
  type AnswerEvent,
  type ChoiceId,
  type Ledger,
  type Session,
} from '@/game/rules';
import { openStore } from '@/storage/store';
import { emptySave, GAME_STORAGE_KEY, readSave, serializeSave, toHistory, type HistoryEntry, type SaveData } from '@/storage/game-save';

type GameContextValue = {
  ready: boolean;
  persistent: boolean;
  saveError: string | null;
  session: Session | null;
  history: HistoryEntry[];
  ledger: Ledger;
  notaDesafio: number;
  bestScore: (programId: string) => number | null;
  startProgram: (programId: string) => boolean;
  answer: (choiceId: ChoiceId, questionId: string, sessionId: string) => AnswerEvent | null;
  review: (questionId: string, sessionId: string) => void;
  next: (questionId: string, sessionId: string) => Session | null;
  redeem: (code: string) => ReturnType<typeof redeemPassword>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SaveData>(emptySave);
  const dataRef = useRef(data);
  const storeRef = useRef<Awaited<ReturnType<typeof openStore>>['store'] | null>(null);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const writesRef = useRef(Promise.resolve());

  const update = useCallback((recipe: (current: SaveData) => SaveData) => {
    const next = recipe(dataRef.current);
    dataRef.current = next;
    setData(next);
    return next;
  }, []);

  useEffect(() => {
    let active = true;
    openStore()
      .then(async ({ store, persistent: canPersist }) => {
        const raw = await store.getItem(GAME_STORAGE_KEY);
        if (!active) {
          return;
        }
        setPersistent(canPersist);
        const restored = readSave(raw);
        storeRef.current = store;
        dataRef.current = restored;
        setData(restored);
        setReady(true);
      })
      .catch(() => {
        if (active) {
          storeRef.current = null;
          setPersistent(false);
          setSaveError('Não foi possível recuperar o progresso. O registro anterior foi preservado; feche e abra o aplicativo para tentar novamente.');
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !storeRef.current) {
      return;
    }
    const store = storeRef.current;
    const snapshot = serializeSave(data);
    writesRef.current = writesRef.current
      .then(() => store.setItem(GAME_STORAGE_KEY, snapshot))
      .then(() => setSaveError(null))
      .catch(() => setSaveError('Não foi possível salvar a última ação. Mantenha o aplicativo aberto; a próxima ação tentará salvar novamente.'));
  }, [data, ready]);

  const startProgram = useCallback((programId: string) => {
    if (!ready) return false;
    const seed = Date.now();
    const quiz = buildQuiz(programId, seed);
    if (!quiz) {
      return false;
    }
    const session = createSession(programId, quiz, new Date(seed).toISOString(), seed);
    update((current) => ({ ...current, session }));
    return true;
  }, [ready, update]);

  const answer = useCallback((choiceId: ChoiceId, questionId: string, sessionId: string) => {
    let event: AnswerEvent | null = null;
    update((current) => {
      if (!current.session || current.session.id !== sessionId || current.session.status === 'finished') {
        return current;
      }
      const result = applyAnswer(current.session, choiceId, questionId);
      event = result.event;
      return result.session === current.session ? current : { ...current, session: result.session };
    });
    return event;
  }, [update]);

  const review = useCallback((questionId: string, sessionId: string) => {
    update((current) => {
      if (!current.session || current.session.id !== sessionId) return current;
      const session = acknowledgeReview(current.session, questionId);
      return session === current.session ? current : { ...current, session };
    });
  }, [update]);

  const next = useCallback((questionId: string, sessionId: string) => {
    let finished: Session | null = null;
    update((current) => {
      if (!current.session || current.session.id !== sessionId || current.session.quiz[current.session.index]?.id !== questionId) {
        return current;
      }
      const session = goToNext(current.session, new Date().toISOString(), questionId);
      if (session === current.session) {
        if (session.status === 'finished') finished = session;
        return current;
      }
      if (session.status !== 'finished') {
        return { ...current, session };
      }
      finished = session;
      const entry = toHistory(session);
      const history = entry && !current.history.some((item) => item.id === entry.id) ? [entry, ...current.history] : current.history;
      return { ...current, session, history };
    });
    return finished;
  }, [update]);

  const redeem = useCallback((code: string) => {
    let result: ReturnType<typeof redeemPassword> = { ok: false, reason: 'invalid' };
    if (!ready) return result;
    update((current) => {
      result = redeemPassword(current.ledger, code, programIdByNumber);
      if (!result.ok) {
        return current;
      }
      return { ...current, ledger: result.ledger };
    });
    return result;
  }, [ready, update]);

  const bestScores = useMemo(() => {
    const scores = new Map<string, number>();
    for (const entry of data.history) {
      if (!entry.pending) scores.set(entry.programId, Math.max(scores.get(entry.programId) ?? 0, entry.score));
    }
    return scores;
  }, [data.history]);
  const bestScore = useCallback((programId: string) => bestScores.get(programId) ?? null, [bestScores]);

  const value = useMemo<GameContextValue>(
    () => ({
      ready,
      persistent,
      saveError,
      session: data.session,
      history: data.history,
      ledger: data.ledger,
      notaDesafio: notaDesafio(data.ledger),
      bestScore,
      startProgram,
      answer,
      review,
      next,
      redeem,
    }),
    [ready, persistent, saveError, data, bestScore, startProgram, answer, review, next, redeem],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const value = useContext(GameContext);
  if (!value) {
    throw new Error('useGame precisa do GameProvider.');
  }
  return value;
}
