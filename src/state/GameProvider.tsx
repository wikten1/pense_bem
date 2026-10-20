import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
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
  session: Session | null;
  history: HistoryEntry[];
  ledger: Ledger;
  notaDesafio: number;
  bestScore: (programId: string) => number | null;
  startProgram: (programId: string) => boolean;
  answer: (choiceId: ChoiceId) => AnswerEvent | null;
  next: () => Session | null;
  redeem: (code: string) => ReturnType<typeof redeemPassword>;
};

const GameContext = createContext<GameContextValue | null>(null);

function emptySave(): SaveData {
  return { session: null, history: [], ledger: emptyLedger() };
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const session = value as Session;
  return typeof session.id === 'string' && Array.isArray(session.quiz) && typeof session.index === 'number' && !!session.questions;
}

function readSave(raw: string | null): SaveData {
  if (!raw) {
    return emptySave();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      session: isSession(parsed.session) ? parsed.session : null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      ledger: parsed.ledger?.codes && parsed.ledger.byProgram ? parsed.ledger : emptyLedger(),
    };
  } catch {
    return emptySave();
  }
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
        setData(readSave(raw));
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setPersistent(false);
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
    storeRef.current.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => undefined);
  }, [data, ready]);

  const startProgram = useCallback((programId: string) => {
    const seed = Date.now();
    const quiz = buildQuiz(programId, seed);
    if (!quiz) {
      return false;
    }
    const session = createSession(programId, quiz, new Date(seed).toISOString(), seed);
    update((current) => ({ ...current, session }));
    return true;
  }, [update]);

  const answer = useCallback((choiceId: ChoiceId) => {
    let event: AnswerEvent | null = null;
    update((current) => {
      if (!current.session || current.session.status === 'finished') {
        return current;
      }
      const result = applyAnswer(current.session, choiceId);
      event = result.event;
      return { ...current, session: result.session };
    });
    return event;
  }, [update]);

  const next = useCallback(() => {
    let finished: Session | null = null;
    update((current) => {
      if (!current.session) {
        return current;
      }
      const session = goToNext(current.session, new Date().toISOString());
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
      const scores = data.history.filter((item) => item.programId === programId).map((item) => item.score);
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
      session: data.session,
      history: data.history,
      ledger: data.ledger,
      notaDesafio: notaDesafio(data.ledger),
      bestScore,
      startProgram,
      answer,
      next,
      redeem,
    }),
    [ready, persistent, data, bestScore, startProgram, answer, next, redeem],
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
