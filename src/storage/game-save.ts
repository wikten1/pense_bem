import {
  emptyLedger, findProgram, MAX_ATTEMPTS, parsePassword, passwordFor, programIdByNumber,
  redeemPassword, restoreSession, sessionStats, type Ledger, type Session,
} from '../game/rules.ts';

export const GAME_STORAGE_KEY = 'pense-bem-aladdin-v1';

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

export type SaveData = { session: Session | null; history: HistoryEntry[]; ledger: Ledger };

export function emptySave(): SaveData {
  return { session: null, history: [], ledger: emptyLedger() };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readHistory(value: unknown): HistoryEntry {
  if (!isRecord(value)) throw new Error('Resultado salvo inválido.');
  const entry = value as HistoryEntry;
  const program = findProgram(entry.programId);
  const pending = entry.pending ?? 0;
  const counts = [entry.score, entry.maxScore, entry.correct, entry.missed, pending, entry.percent];
  const password = typeof entry.password === 'string' ? parsePassword(entry.password) : null;
  if (!program || typeof entry.id !== 'string' || !entry.id ||
      typeof entry.finishedAt !== 'string' || !Number.isFinite(Date.parse(entry.finishedAt)) ||
      !counts.every((count) => Number.isInteger(count) && count >= 0) ||
      entry.correct + entry.missed + pending !== program.questionCount ||
      entry.maxScore !== (program.questionCount - pending) * MAX_ATTEMPTS || entry.score > entry.correct * MAX_ATTEMPTS ||
      entry.score < entry.correct || entry.percent !== (entry.maxScore ? Math.round(entry.score / entry.maxScore * 100) : 0) ||
      (entry.password !== null && (!password || pending > 0 || program.mode === 'practice' ||
        password.programNumber !== program.number || password.score !== entry.score))) {
    throw new Error('Resultado salvo inválido.');
  }
  return { ...entry, programNumber: program.number, programTitle: program.title };
}

export function readSave(raw: string | null): SaveData {
  if (raw === null) return emptySave();
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || (parsed.version !== undefined && parsed.version !== 2) ||
      !Array.isArray(parsed.history) || !isRecord(parsed.ledger) || !Array.isArray(parsed.ledger.codes)) {
    throw new Error('Progresso salvo inválido.');
  }
  // Derive contributions from validated codes instead of trusting persisted totals.
  let ledger = emptyLedger();
  for (const code of parsed.ledger.codes) {
    if (typeof code !== 'string') throw new Error('Senha salva inválida.');
    const result = redeemPassword(ledger, code, programIdByNumber);
    if (!result.ok) throw new Error('Nota Desafio salva inválida.');
    ledger = result.ledger;
  }
  return {
    session: parsed.session === null ? null : restoreSession(parsed.session),
    history: parsed.history.map(readHistory),
    ledger,
  };
}

export function serializeSave(data: SaveData): string {
  const session = data.session;
  return JSON.stringify({
    version: 2,
    session: session ? {
      ...session,
      // Content is immutable and bundled. Keep ordering and legacy missing keys only.
      quiz: session.quiz.map(({ id, correctChoiceId }) => ({ id, ...(correctChoiceId === null ? { correctChoiceId: null } : {}) })),
      questions: Object.fromEntries(Object.entries(session.questions).map(([id, state]) => [id, {
        wrongChoices: state.wrongChoices, chosenCorrect: state.chosenCorrect,
        ...(state.pending ? { pending: true, finished: state.finished } : {}),
      }])),
    } : null,
    history: data.history,
    // Keep byProgram for compatibility with earlier builds; reads recalculate it.
    ledger: data.ledger,
  });
}

export function toHistory(session: Session): HistoryEntry | null {
  const program = findProgram(session.programId);
  if (!program || !session.finishedAt) return null;
  const stats = sessionStats(session);
  return {
    id: session.id, programId: session.programId, programNumber: program.number, programTitle: program.title,
    score: stats.score, maxScore: stats.maxScore, correct: stats.correct, missed: stats.missed,
    pending: stats.pending, percent: stats.percent, finishedAt: session.finishedAt, password: passwordFor(session),
  };
}
