export const MAX_ATTEMPTS = 3;
export const QUESTIONS_PER_PROGRAM = 30;
export const MAX_POINTS = QUESTIONS_PER_PROGRAM * MAX_ATTEMPTS;

export type ChoiceId = 'red' | 'yellow' | 'blue' | 'green';

export type Choice = {
  id: ChoiceId;
  text: string;
};

export type Question = {
  id: string;
  programId: string;
  number: number;
  prompt: string;
  choices: Choice[];
  correctChoiceId: ChoiceId | null;
  reviewNotes?: string;
};

export type SectionNote = {
  title: string;
  from: number;
  to: number;
  needsIllustration: boolean;
};

export type ProgramMode = 'sequence' | 'review' | 'practice';

export type Program = {
  id: string;
  number: number;
  title: string;
  entryCode: string[];
  questionCount: number;
  mode: ProgramMode;
  questions: Question[];
  sections: SectionNote[];
  notes: string;
};

export type QuestionState = {
  questionId: string;
  wrongChoices: ChoiceId[];
  attemptsUsed: number;
  finished: boolean;
  points: number;
  correct: boolean;
  chosenCorrect: ChoiceId | null;
};

export type Session = {
  id: string;
  programId: string;
  quiz: Question[];
  questions: Record<string, QuestionState>;
  index: number;
  status: 'in_progress' | 'finished';
  startedAt: string;
  finishedAt?: string;
  seed?: number;
};

export type AnswerEvent =
  | { type: 'correct'; points: number; attemptsUsed: number }
  | { type: 'incorrect'; attemptsLeft: number }
  | { type: 'failed' }
  | { type: 'already_finished' }
  | { type: 'already_selected' }
  | { type: 'missing_key' };

export type Ledger = {
  codes: string[];
  byProgram: Record<string, { code: string; score: number }>;
};

export type RedeemResult =
  | { ok: true; ledger: Ledger; notaDesafio: number; replaced: boolean }
  | { ok: false; reason: 'invalid' | 'duplicate' | 'unknown_program' | 'not_higher' };

const CHOICE_ORDER: ChoiceId[] = ['red', 'yellow', 'blue', 'green'];

export function pointsForAttempt(attempt: number): number {
  if (attempt < 1 || attempt > MAX_ATTEMPTS) {
    throw new Error('Tentativa fora do intervalo de 1 a 3.');
  }
  return MAX_ATTEMPTS - attempt + 1;
}

export function emptyLedger(): Ledger {
  return { codes: [], byProgram: {} };
}

export function notaDesafio(ledger: Ledger): number {
  return Object.values(ledger.byProgram).reduce((sum, item) => sum + item.score, 0);
}

export function createPassword(programNumber: number, score: number): string {
  if (programNumber < 1 || programNumber > 6) {
    throw new Error('Programa sem senha.');
  }
  if (score < 0 || score > MAX_POINTS) {
    throw new Error('Pontuação inválida para senha.');
  }
  const check = (programNumber * 97 + score * 13 + 41) % 1000;
  return `AL${programNumber}${score.toString().padStart(2, '0')}${check.toString().padStart(3, '0')}`;
}

export function parsePassword(raw: string): { programNumber: number; score: number } | null {
  const code = raw.trim().toUpperCase();
  const match = /^AL([1-6])(\d{2})(\d{3})$/.exec(code);
  if (!match) {
    return null;
  }
  const programNumber = Number(match[1]);
  const score = Number(match[2]);
  const check = Number(match[3]);
  if (score > MAX_POINTS) {
    return null;
  }
  const expected = (programNumber * 97 + score * 13 + 41) % 1000;
  if (check !== expected) {
    return null;
  }
  return { programNumber, score };
}

export function redeemPassword(
  ledger: Ledger,
  rawCode: string,
  programIdByNumber: (programNumber: number) => string | undefined,
): RedeemResult {
  const parsed = parsePassword(rawCode);
  if (!parsed) {
    return { ok: false, reason: 'invalid' };
  }
  const code = rawCode.trim().toUpperCase();
  if (ledger.codes.includes(code)) {
    return { ok: false, reason: 'duplicate' };
  }
  const programId = programIdByNumber(parsed.programNumber);
  if (!programId) {
    return { ok: false, reason: 'unknown_program' };
  }
  const current = ledger.byProgram[programId];
  if (current && parsed.score <= current.score) {
    return { ok: false, reason: 'not_higher' };
  }
  const next: Ledger = {
    codes: [...ledger.codes, code],
    byProgram: {
      ...ledger.byProgram,
      [programId]: { code, score: parsed.score },
    },
  };
  return {
    ok: true,
    ledger: next,
    notaDesafio: notaDesafio(next),
    replaced: Boolean(current),
  };
}

function hashUnit(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickReview(groups: Question[][], seed: number, perProgram = 6): Question[] {
  const random = hashUnit(seed);
  const picked: Question[] = [];
  for (const group of groups) {
    const copy = [...group];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      const current = copy[index];
      copy[index] = copy[swap]!;
      copy[swap] = current!;
    }
    picked.push(...copy.slice(0, Math.min(perProgram, copy.length)));
  }
  return picked;
}

function blankState(questionId: string): QuestionState {
  return {
    questionId,
    wrongChoices: [],
    attemptsUsed: 0,
    finished: false,
    points: 0,
    correct: false,
    chosenCorrect: null,
  };
}

export function createSession(programId: string, quiz: Question[], now: string, seed?: number): Session {
  const questions: Record<string, QuestionState> = {};
  for (const question of quiz) {
    questions[question.id] = blankState(question.id);
  }
  return {
    id: `${programId}-${now}`,
    programId,
    quiz,
    questions,
    index: 0,
    status: 'in_progress',
    startedAt: now,
    seed,
  };
}

export function sessionScore(session: Session): number {
  return session.quiz.reduce((sum, question) => sum + (session.questions[question.id]?.points ?? 0), 0);
}

export function sessionStats(session: Session) {
  const score = sessionScore(session);
  const total = session.quiz.length;
  const correct = session.quiz.filter((question) => session.questions[question.id]?.correct).length;
  const missed = session.quiz.filter((question) => {
    const state = session.questions[question.id];
    return state?.finished && !state.correct;
  }).length;
  const finished = session.quiz.filter((question) => session.questions[question.id]?.finished).length;
  const maxScore = total * MAX_ATTEMPTS;
  return {
    score,
    maxScore,
    correct,
    missed,
    finished,
    total,
    percent: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100),
  };
}

export function applyAnswer(session: Session, choiceId: ChoiceId): { session: Session; event: AnswerEvent } {
  const current = session.quiz[session.index];
  if (!current || session.status === 'finished') {
    return { session, event: { type: 'already_finished' } };
  }
  const state = session.questions[current.id] ?? blankState(current.id);
  if (state.finished) {
    return { session, event: { type: 'already_finished' } };
  }
  if (!current.correctChoiceId) {
    return { session, event: { type: 'missing_key' } };
  }
  if (!CHOICE_ORDER.includes(choiceId) || !current.choices.some((choice) => choice.id === choiceId)) {
    return { session, event: { type: 'already_selected' } };
  }
  if (state.wrongChoices.includes(choiceId)) {
    return { session, event: { type: 'already_selected' } };
  }

  const attemptsUsed = state.attemptsUsed + 1;
  if (choiceId === current.correctChoiceId) {
    const points = pointsForAttempt(attemptsUsed);
    const nextState: QuestionState = {
      ...state,
      attemptsUsed,
      finished: true,
      points,
      correct: true,
      chosenCorrect: choiceId,
    };
    return {
      session: replaceQuestion(session, current.id, nextState),
      event: { type: 'correct', points, attemptsUsed },
    };
  }

  const finished = attemptsUsed >= MAX_ATTEMPTS;
  const nextState: QuestionState = {
    ...state,
    attemptsUsed,
    wrongChoices: [...state.wrongChoices, choiceId],
    finished,
    points: 0,
    correct: false,
    chosenCorrect: null,
  };
  return {
    session: replaceQuestion(session, current.id, nextState),
    event: finished ? { type: 'failed' } : { type: 'incorrect', attemptsLeft: MAX_ATTEMPTS - attemptsUsed },
  };
}

function replaceQuestion(session: Session, questionId: string, state: QuestionState): Session {
  const questions = { ...session.questions, [questionId]: state };
  const next: Session = { ...session, questions };
  return { ...next, questions };
}

export function goToNext(session: Session, now: string): Session {
  const current = session.quiz[session.index];
  if (!current || !session.questions[current.id]?.finished || session.status === 'finished') {
    return session;
  }
  if (session.index >= session.quiz.length - 1) {
    return {
      ...session,
      status: 'finished',
      finishedAt: now,
    };
  }
  return { ...session, index: session.index + 1 };
}

export function passwordFor(session: Session): string | null {
  if (session.status !== 'finished') {
    return null;
  }
  const program = findProgram(session.programId);
  if (!program || program.mode === 'practice' || program.number < 1) {
    return null;
  }
  const stats = sessionStats(session);
  if (stats.total !== QUESTIONS_PER_PROGRAM || stats.finished !== QUESTIONS_PER_PROGRAM) {
    return null;
  }
  return createPassword(program.number, stats.score);
}

function choice(id: ChoiceId, text: string): Choice {
  return { id, text };
}

export const PRACTICE_PROGRAM: Program = {
  id: 'practice',
  number: 0,
  title: 'Treino da mecânica',
  entryCode: [],
  questionCount: 3,
  mode: 'practice',
  notes:
    'Perguntas originais deste aplicativo para experimentar as três tentativas. Não pertencem à revista do Aladdin.',
  sections: [],
  questions: [
    {
      id: 'practice-1',
      programId: 'practice',
      number: 1,
      prompt: 'No Pense Bem deste aplicativo, quantos pontos vale um acerto na primeira tentativa?',
      choices: [choice('red', '1 ponto'), choice('yellow', '2 pontos'), choice('blue', '0 pontos'), choice('green', '3 pontos')],
      correctChoiceId: 'green',
    },
    {
      id: 'practice-2',
      programId: 'practice',
      number: 2,
      prompt: 'Quantas tentativas cada pergunta oferece?',
      choices: [choice('red', 'Uma'), choice('yellow', 'Três'), choice('blue', 'Cinco'), choice('green', 'Dez')],
      correctChoiceId: 'yellow',
    },
    {
      id: 'practice-3',
      programId: 'practice',
      number: 3,
      prompt: 'Qual é a pontuação máxima de um programa com 30 perguntas?',
      choices: [choice('red', '30'), choice('yellow', '60'), choice('blue', '90'), choice('green', '100')],
      correctChoiceId: 'blue',
    },
  ],
};

export const ALADDIN_PROGRAMS: Program[] = [
  {
    id: 'p1',
    number: 1,
    title: 'Programa 1',
    entryCode: ['LIVRO', '0', '4', '1', 'ENTER'],
    questionCount: 30,
    mode: 'sequence',
    questions: [],
    sections: [
      { title: 'Aladdin', from: 1, to: 6, needsIllustration: true },
      { title: 'A princesa Jasmine', from: 7, to: 14, needsIllustration: false },
      { title: 'Rajah, o tigre', from: 15, to: 20, needsIllustration: true },
      { title: 'A lâmpada maravilhosa', from: 21, to: 28, needsIllustration: true },
      { title: 'Fechamento da história', from: 29, to: 30, needsIllustration: false },
    ],
    notes: 'Questões 1 a 30. Várias dependem da figura da página.',
  },
  {
    id: 'p2',
    number: 2,
    title: 'Programa 2',
    entryCode: ['LIVRO', '0', '4', '2', 'ENTER'],
    questionCount: 30,
    mode: 'sequence',
    questions: [],
    sections: [
      { title: 'As Mil e Uma Noites', from: 31, to: 36, needsIllustration: true },
      { title: 'O mundo árabe', from: 38, to: 44, needsIllustration: true },
      { title: 'Palavras árabes', from: 45, to: 51, needsIllustration: true },
      { title: 'Bagdá, a cidade encantada', from: 52, to: 57, needsIllustration: false },
      { title: 'Quadrado mágico', from: 58, to: 60, needsIllustration: false },
    ],
    notes: 'Questões 31 a 60. A questão 37 não ficou isolada com segurança na leitura das páginas.',
  },
  {
    id: 'p3',
    number: 3,
    title: 'Programa 3',
    entryCode: ['LIVRO', '0', '4', '3', 'ENTER'],
    questionCount: 30,
    mode: 'sequence',
    questions: [],
    sections: [
      { title: 'Simbad, o marujo', from: 61, to: 67, needsIllustration: true },
      { title: 'O pássaro-gigante', from: 68, to: 73, needsIllustration: true },
      { title: 'A moda em Bagdá', from: 80, to: 86, needsIllustration: true },
      { title: 'Cruzadinha', from: 87, to: 90, needsIllustration: false },
    ],
    notes: 'Questões 61 a 90. O intervalo 74 a 79 fica em páginas intermediárias do mesmo programa.',
  },
  {
    id: 'p4',
    number: 4,
    title: 'Programa 4',
    entryCode: ['LIVRO', '0', '4', '4', 'ENTER'],
    questionCount: 30,
    mode: 'sequence',
    questions: [],
    sections: [
      { title: 'Ali Babá e os quarenta ladrões', from: 91, to: 98, needsIllustration: true },
      { title: 'Descobrindo o segredo', from: 99, to: 104, needsIllustration: true },
      { title: 'A caverna misteriosa', from: 105, to: 111, needsIllustration: true },
      { title: 'A ambição castigada', from: 112, to: 120, needsIllustration: true },
    ],
    notes: 'Questões 91 a 120. A ficha de pontos do programa 4 fecha na questão 120.',
  },
  {
    id: 'p5',
    number: 5,
    title: 'Programa 5',
    entryCode: ['LIVRO', '0', '4', '5', 'ENTER'],
    questionCount: 30,
    mode: 'sequence',
    questions: [],
    sections: [
      { title: 'O filme', from: 121, to: 126, needsIllustration: true },
      { title: 'Como se faz um filme', from: 127, to: 134, needsIllustration: false },
      { title: 'O desenho animado', from: 135, to: 140, needsIllustration: true },
      { title: 'O som e a música', from: 141, to: 146, needsIllustration: true },
      { title: 'O filme em vídeo', from: 147, to: 150, needsIllustration: false },
    ],
    notes: 'Questões 121 a 150.',
  },
  {
    id: 'p6',
    number: 6,
    title: 'Programa 6',
    entryCode: ['LIVRO', '0', '4', '6', 'ENTER'],
    questionCount: 30,
    mode: 'review',
    questions: [],
    sections: [],
    notes:
      'Revisão. A revista diz que serão seis questões de cada programa anterior, escolhidas ao acaso, e pede para dispensar este programa quando se joga sem o equipamento.',
  },
];

export function findProgram(programId: string): Program | undefined {
  if (programId === PRACTICE_PROGRAM.id) {
    return PRACTICE_PROGRAM;
  }
  return ALADDIN_PROGRAMS.find((program) => program.id === programId);
}

export function programIdByNumber(programNumber: number): string | undefined {
  return ALADDIN_PROGRAMS.find((program) => program.number === programNumber)?.id;
}

export function buildQuiz(programId: string, seed: number): Question[] | null {
  const program = findProgram(programId);
  if (!program) {
    return null;
  }
  if (program.mode === 'practice') {
    return program.questions;
  }
  if (program.mode === 'review') {
    const groups = ALADDIN_PROGRAMS.filter((item) => item.mode === 'sequence').map((item) => item.questions);
    if (groups.some((group) => group.length < 6)) {
      return null;
    }
    return pickReview(groups, seed, 6);
  }
  if (program.questions.length !== QUESTIONS_PER_PROGRAM) {
    return null;
  }
  if (program.questions.some((question) => !question.correctChoiceId || question.choices.length !== 4)) {
    return null;
  }
  return program.questions;
}

export function auditAladdin(): string[] {
  const issues: string[] = [];
  if (ALADDIN_PROGRAMS.length !== 6) {
    issues.push('A revista organiza seis programas.');
  }
  for (const program of ALADDIN_PROGRAMS) {
    const expectedCode = ['LIVRO', '0', '4', String(program.number), 'ENTER'];
    if (program.entryCode.join('-') !== expectedCode.join('-')) {
      issues.push(`Código de entrada divergente no programa ${program.number}.`);
    }
    if (program.questionCount !== QUESTIONS_PER_PROGRAM) {
      issues.push(`Programa ${program.number} deveria ter 30 perguntas.`);
    }
    if (program.mode !== 'review' && program.questions.length !== QUESTIONS_PER_PROGRAM) {
      issues.push(
        `Programa ${program.number}: a revista indica 30 perguntas e o aplicativo tem ${program.questions.length} transcritas.`,
      );
    }
    program.questions.forEach((question, index) => {
      if (question.number !== program.sections[0]?.from + index && program.mode === 'sequence') {
        issues.push(`Ordem inesperada na pergunta ${question.id}.`);
      }
      if (!question.correctChoiceId) {
        issues.push(`Pergunta ${question.number} sem gabarito confirmado.`);
      }
    });
  }
  issues.push('O PDF não imprime gabarito.');
  issues.push('O PDF não descreve senha nem Nota Desafio.');
  issues.push('A questão 37 não foi localizada com segurança.');
  return issues;
}

export const CONTENT_GAP =
  'As perguntas da revista não entraram no aplicativo. O PDF não traz gabarito, boa parte das questões só faz sentido com a ilustração da página, e o texto é material protegido da Disney e da Editora Nova Cultural (1993).';

export const SCORING_NOTE =
  'Na revista, quem joga sem o equipamento marca 1 ponto por acerto. O visor do brinquedo mostra a contagem ao final, sem imprimir a tabela. Este aplicativo usa a escala pedida para o equipamento: 3, 2 ou 1 ponto conforme a tentativa, e 0 se as três falharem. Máximo de 90 pontos por programa.';

export const PASSWORD_NOTE =
  'Regra nova, não descrita na revista: ao concluir um programa de 30 perguntas o aplicativo gera a senha AL + número do programa + pontuação + verificador. Resgatá-la uma vez soma essa pontuação à Nota Desafio. A mesma senha não conta de novo. Se uma senha posterior do mesmo programa tiver pontuação maior, ela substitui a contribuição anterior. A pontuação do programa e a Nota Desafio ficam separadas.';
