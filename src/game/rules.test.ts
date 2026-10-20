import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALADDIN_PROGRAMS,
  applyAnswer,
  auditAladdin,
  createPassword,
  createSession,
  emptyLedger,
  goToNext,
  notaDesafio,
  parsePassword,
  passwordFor,
  pickReview,
  pointsForAttempt,
  PRACTICE_PROGRAM,
  redeemPassword,
  sessionScore,
  sessionStats,
  type ChoiceId,
  type Question,
} from './rules.ts';

function question(id: string, correct: ChoiceId, number = 1): Question {
  return {
    id,
    programId: 'fixture',
    number,
    prompt: id,
    choices: [
      { id: 'red', text: 'a' },
      { id: 'yellow', text: 'b' },
      { id: 'blue', text: 'c' },
      { id: 'green', text: 'd' },
    ],
    correctChoiceId: correct,
  };
}

test('pontuação segue a tentativa do acerto', () => {
  assert.equal(pointsForAttempt(1), 3);
  assert.equal(pointsForAttempt(2), 2);
  assert.equal(pointsForAttempt(3), 1);

  let session = createSession('fixture', [question('q1', 'green')], '2026-01-01T00:00:00.000Z');
  let result = applyAnswer(session, 'green');
  assert.equal(result.event.type, 'correct');
  assert.equal(sessionScore(result.session), 3);

  session = createSession('fixture', [question('q1', 'green')], '2026-01-01T00:00:00.000Z');
  session = applyAnswer(session, 'red').session;
  result = applyAnswer(session, 'green');
  assert.equal(result.event.type, 'correct');
  if (result.event.type === 'correct') {
    assert.equal(result.event.points, 2);
  }

  session = createSession('fixture', [question('q1', 'green')], '2026-01-01T00:00:00.000Z');
  session = applyAnswer(session, 'red').session;
  session = applyAnswer(session, 'yellow').session;
  result = applyAnswer(session, 'green');
  assert.equal(sessionScore(result.session), 1);
});

test('três erros encerram a pergunta com zero e sem novo ponto', () => {
  let session = createSession('fixture', [question('q1', 'green')], '2026-01-01T00:00:00.000Z');
  session = applyAnswer(session, 'red').session;
  session = applyAnswer(session, 'yellow').session;
  const failed = applyAnswer(session, 'blue');
  assert.equal(failed.event.type, 'failed');
  assert.equal(sessionScore(failed.session), 0);
  const again = applyAnswer(failed.session, 'green');
  assert.equal(again.event.type, 'already_finished');
  assert.equal(sessionScore(again.session), 0);
});

test('alternativa errada não pode ser escolhida de novo', () => {
  const session = createSession('fixture', [question('q1', 'green')], '2026-01-01T00:00:00.000Z');
  const first = applyAnswer(session, 'red');
  const second = applyAnswer(first.session, 'red');
  assert.equal(second.event.type, 'already_selected');
  assert.equal(second.session.questions.q1?.attemptsUsed, 1);
});

test('acerto não pontua duas vezes', () => {
  const session = createSession('fixture', [question('q1', 'blue')], '2026-01-01T00:00:00.000Z');
  const correct = applyAnswer(session, 'blue');
  const repeat = applyAnswer(correct.session, 'green');
  assert.equal(repeat.event.type, 'already_finished');
  assert.equal(sessionScore(repeat.session), 3);
});

test('resultado de 30 acertos de primeira soma 90', () => {
  const quiz = Array.from({ length: 30 }, (_, index) => question(`q${index + 1}`, 'red', index + 1));
  let session = createSession('p1', quiz, '2026-01-01T00:00:00.000Z');
  for (let index = 0; index < 30; index += 1) {
    session = applyAnswer(session, 'red').session;
    session = goToNext(session, '2026-01-01T00:01:00.000Z');
  }
  const stats = sessionStats(session);
  assert.equal(session.status, 'finished');
  assert.equal(stats.score, 90);
  assert.equal(stats.correct, 30);
  assert.equal(stats.missed, 0);
  assert.equal(stats.percent, 100);
  assert.equal(passwordFor(session), 'AL190308');
});

test('senha confere o verificador e não soma duas vezes', () => {
  const code = createPassword(1, 90);
  assert.equal(code, 'AL190308');
  assert.deepEqual(parsePassword(code), { programNumber: 1, score: 90 });
  assert.equal(parsePassword('AL190309'), null);

  const first = redeemPassword(emptyLedger(), code, (number) => (number === 1 ? 'p1' : undefined));
  assert.equal(first.ok, true);
  if (!first.ok) {
    return;
  }
  assert.equal(first.notaDesafio, 90);
  const duplicate = redeemPassword(first.ledger, code, () => 'p1');
  assert.deepEqual(duplicate, { ok: false, reason: 'duplicate' });
  assert.equal(notaDesafio(first.ledger), 90);

  const lower = redeemPassword(first.ledger, createPassword(1, 10), () => 'p1');
  assert.deepEqual(lower, { ok: false, reason: 'not_higher' });

  const higher = redeemPassword(first.ledger, createPassword(2, 30), (number) => `p${number}`);
  assert.equal(higher.ok, true);
  if (higher.ok) {
    assert.equal(higher.notaDesafio, 120);
  }
});

test('revisão sorteia seis questões de cada programa e permanece estável', () => {
  const groups = [1, 2, 3, 4, 5].map((program) =>
    Array.from({ length: 8 }, (_, index) => question(`p${program}-${index}`, 'red', index + 1)),
  );
  const first = pickReview(groups, 42, 6);
  const second = pickReview(groups, 42, 6);
  assert.equal(first.length, 30);
  assert.deepEqual(
    first.map((item) => item.id),
    second.map((item) => item.id),
  );
  for (const program of [1, 2, 3, 4, 5]) {
    assert.equal(first.filter((item) => item.id.startsWith(`p${program}-`)).length, 6);
  }
});

test('revista do Aladdin está catalogada sem transcrever perguntas nem inventar gabarito', () => {
  assert.equal(ALADDIN_PROGRAMS.length, 6);
  assert.deepEqual(
    ALADDIN_PROGRAMS.map((program) => program.entryCode.join(' ')),
    [
      'LIVRO 0 4 1 ENTER',
      'LIVRO 0 4 2 ENTER',
      'LIVRO 0 4 3 ENTER',
      'LIVRO 0 4 4 ENTER',
      'LIVRO 0 4 5 ENTER',
      'LIVRO 0 4 6 ENTER',
    ],
  );
  assert.ok(ALADDIN_PROGRAMS.every((program) => program.questionCount === 30));
  assert.ok(ALADDIN_PROGRAMS.every((program) => program.questions.length === 0));
  const audit = auditAladdin();
  assert.ok(audit.some((issue) => issue.includes('gabarito')));
  assert.ok(audit.some((issue) => issue.includes('0 transcritas')));
  assert.equal(PRACTICE_PROGRAM.questions.length, 3);
});
