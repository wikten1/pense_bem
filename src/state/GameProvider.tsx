import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  acknowledgeReview,
  applyAnswer,
  buildQuiz,
  createSession,
  emptyLedger,
  findProgram,
  goToNext,
  notaDesafio,
  passwordFor,
  programIdByNumber,
  redeemPassword,
  restoreSession,
  sessionStats,
  type AnswerEvent,
  type ChoiceId,
  type Ledger,
  type Session,
} from '@/game/rules';
import { openStore } from '@/storage/store';

const STORAGE_KEY = 'pense-bem-aladdin-v1';

export type HistoryEntry = {
  id: string;
  programId: string;
  programNumber: number;
  programTitle: string;
  score: number;
  maxScore: number;
  correct: number;
  missed: number;
  pending?: number;
  percent: number;
  finishedAt: string;
  password: string | null;
};

type SaveData = {
  session: Session | null;
  history: HistoryEntry[];
  ledger: Ledger;
};

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

function emptySave(): SaveData {
  return { session: null, history: [], ledger: emptyLedger() };
}

function readSave(raw: string | null): SaveData {
  if (!raw) {
    return emptySave();
  }
  const parsed = JSON.parse(raw) as Partial<SaveData>;
  return {
    session: parsed.session ? restoreSession(parsed.session) : null,
    history: Array.isArray(parsed.history) ? parsed.history : [],
    ledger: parsed.ledger?.codes && parsed.ledger.byProgram ? parsed.ledger : emptyLedger(),
  };
}

function toHistory(session: Session): HistoryEntry | null {
  const program = findProgram(session.programId);
  if (!program || !session.finishedAt) {
    return null;
  }
  const stats = sessionStats(session);
  return {
    id: session.id,
    programId: session.programId,
    programNumber: program.number,
    programTitle: program.title,
    score: stats.score,
    maxScore: stats.maxScore,
    correct: stats.correct,
    missed: stats.missed,
    pending: stats.pending,
    percent: stats.percent,
    finishedAt: session.finishedAt,
    password: passwordFor(session),
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SaveData>(emptySave);
  const dataRef = useRef(data);
  const storeRef = useRef<Awaited<ReturnType<typeof openStore>>['store'] | null>(null);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const writesRef = useRef(Promise.resolve());

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

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
        storeRef.current = store;
        const raw = await store.getItem(STORAGE_KEY);
        if (!active) {
          return;
        }
        setPersistent(canPersist);
        const restored = readSave(raw);
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
    const snapshot = JSON.stringify(data);
    writesRef.current = writesRef.current
      .then(() => store.setItem(STORAGE_KEY, snapshot))
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
      return { ...current, session: result.session };
    });
    return event;
  }, [update]);

  const review = useCallback((questionId: string, sessionId: string) => {
    update((current) => {
      if (!current.session || current.session.id !== sessionId) return current;
      return { ...current, session: acknowledgeReview(current.session, questionId) };
    });
  }, [update]);

  const next = useCallback((questionId: string, sessionId: string) => {
    let finished: Session | null = null;
    update((current) => {
      if (!current.session || current.session.id !== sessionId || current.session.quiz[current.session.index]?.id !== questionId) {
        return current;
      }
      const session = goToNext(current.session, new Date().toISOString(), questionId);
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
    update((current) => {
      result = redeemPassword(current.ledger, code, programIdByNumber);
      if (!result.ok) {
        return current;
      }
      return { ...current, ledger: result.ledger };
    });
    return result;
  }, [update]);

  const bestScore = useCallback(
    (programId: string) => {
      const scores = data.history.filter((item) => item.programId === programId && !item.pending).map((item) => item.score);
      if (scores.length === 0) {
        return null;
      }
      return Math.max(...scores);
    },
    [data.history],
  );

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
