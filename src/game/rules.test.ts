import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALADDIN_PROGRAMS,
  acknowledgeReview,
  applyAnswer,
  auditAladdin,
  buildQuiz,
  createPassword,
  createSession,
  emptyLedger,
  findProgramByEntryCode,
  goToNext,
  notaDesafio,
  parsePassword,
  passwordFor,
  pickReview,
  pointsForAttempt,
  PRACTICE_PROGRAM,
  redeemPassword,
  restoreSession,
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

test('revista contém 150 perguntas revisadas e jogáveis', () => {
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
  const catalog = ALADDIN_PROGRAMS.flatMap((program) => program.questions);
  assert.equal(catalog.length, 150);
  assert.equal(new Set(catalog.map((question) => question.id)).size, 150);
  assert.equal(catalog.filter((question) => question.correctChoiceId).length, 150);
  assert.equal(catalog.filter((question) => !question.correctChoiceId).length, 0);
  for (const question of catalog) {
    assert.equal(question.choices.length, 4);
    assert.deepEqual(question.choices.map((choice) => choice.id), ['red', 'yellow', 'blue', 'green']);
    assert.ok(question.answerBasis);
    assert.ok(!question.reviewNotes?.includes('pendente'));
  }
  const audit = auditAladdin();
  assert.ok(!audit.some((issue) => issue.includes('sem gabarito')));
  assert.ok(!audit.some((issue) => issue.includes('transcritas')));
  assert.equal(PRACTICE_PROGRAM.questions.length, 3);
});

test('os seis programas são avaliados integralmente e geram senha com 90 pontos', () => {
  for (const program of ALADDIN_PROGRAMS) {
    const quiz = buildQuiz(program.id, 42)!;
    assert.equal(quiz.length, 30);
    let session = createSession(program.id, quiz, '2026-01-01T00:00:00.000Z', 42);
    for (const question of quiz) {
      assert.equal(goToNext(session, '2026-01-01T00:01:00.000Z'), session);
      assert.ok(question.correctChoiceId);
      assert.equal(acknowledgeReview(session, question.id), session);
      session = applyAnswer(session, question.correctChoiceId).session;
      session = goToNext(session, '2026-01-01T00:01:00.000Z');
      session = restoreSession(JSON.parse(JSON.stringify(session)));
    }
    const stats = sessionStats(session);
    assert.equal(session.status, 'finished');
    assert.equal(stats.finished, 30);
    assert.equal(stats.missed, 0);
    assert.equal(stats.correct, 30);
    assert.equal(stats.pending, 0);
    assert.equal(stats.score, 90);
    assert.equal(stats.maxScore, 90);
    assert.equal(stats.percent, 100);
    assert.equal(passwordFor(session), createPassword(program.number, 90));
  }
});

test('programa 6 mantém seis perguntas de cada programa após reabrir', () => {
  const quiz = buildQuiz('p6', 123)!;
  assert.equal(new Set(quiz.map((question) => question.id)).size, 30);
  for (let number = 1; number <= 5; number += 1) {
    assert.equal(quiz.filter((question) => question.programId === `p${number}`).length, 6);
  }
  const session = createSession('p6', quiz, '2026-01-01T00:00:00.000Z', 123);
  assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(session))).quiz, quiz);
});

test('ações atrasadas não respondem nem pulam a pergunta seguinte', () => {
  const quiz = buildQuiz('p1', 1)!;
  let session = createSession('p1', quiz, '2026-01-01T00:00:00.000Z', 1);
  session = applyAnswer(session, quiz[0].correctChoiceId!, quiz[0].id).session;
  session = goToNext(session, '2026-01-01T00:01:00.000Z', quiz[0].id);
  assert.equal(acknowledgeReview(session, quiz[0].id), session);
  assert.equal(applyAnswer(session, 'red', quiz[0].id).session, session);
  assert.equal(goToNext(session, '2026-01-01T00:01:00.000Z', quiz[0].id), session);
  assert.equal(session.index, 1);
});

test('retomada recupera tentativas e recalcula pontos sem confiar nos totais salvos', () => {
  let session = createSession('practice', PRACTICE_PROGRAM.questions, '2026-01-01T00:00:00.000Z');
  session = applyAnswer(session, 'red').session;
  let restored = restoreSession(JSON.parse(JSON.stringify(session)));
  assert.equal(restored.questions['practice-1'].attemptsUsed, 1);
  assert.equal(applyAnswer(restored, 'red').event.type, 'already_selected');
  restored = applyAnswer(restored, 'green').session;
  const tampered = JSON.parse(JSON.stringify(restored));
  tampered.questions['practice-1'].points = 90;
  assert.equal(sessionScore(restoreSession(tampered)), 2);
  tampered.questions['practice-1'].wrongChoices = ['red', 'red'];
  assert.throws(() => restoreSession(tampered));
  assert.throws(() => restoreSession({ ...session, index: 2 }));
  assert.throws(() => restoreSession({ ...session, status: 'finished' }));
});

test('código do livro encontra o programa de 1 a 6', () => {
  assert.equal(findProgramByEntryCode('041')?.number, 1);
  assert.equal(findProgramByEntryCode('0 4 6')?.id, 'p6');
  assert.equal(findProgramByEntryCode('livro 0 4 3 enter')?.number, 3);
  assert.equal(findProgramByEntryCode('LIVRO045ENTER')?.id, 'p5');
  assert.equal(findProgramByEntryCode('1'), undefined);
  assert.equal(findProgramByEntryCode('099'), undefined);
});

function oldQuiz() {
  return buildQuiz('p1', 1)!.map((question) => question.number <= 6
    ? { ...question, correctChoiceId: null, illustration: undefined }
    : question);
}

test('retomada atualiza a primeira questão antiga ainda não respondida', () => {
  const saved = createSession('p1', oldQuiz(), '2026-01-01T00:00:00.000Z', 1);
  const restored = restoreSession(JSON.parse(JSON.stringify(saved)));
  assert.equal(restored.quiz[0].correctChoiceId, 'red');
  assert.equal(restored.quiz[0].illustration?.id, 'palace');
  assert.equal(applyAnswer(restored, 'red').event.type, 'correct');
});

test('retomada reabre pendências e preserva acertos e tentativas posteriores, inclusive após salvar de novo', () => {
  let saved = createSession('p1', oldQuiz(), '2026-01-01T00:00:00.000Z', 1);
  for (let index = 0; index < 6; index += 1) {
    saved = acknowledgeReview(saved, saved.quiz[index].id);
    saved = goToNext(saved, '2026-01-01T00:01:00.000Z');
  }
  saved = applyAnswer(saved, 'red').session; // Q7: acertada, 3 pontos.
  saved = goToNext(saved, '2026-01-01T00:01:00.000Z');
  saved = applyAnswer(saved, 'red').session; // Q8: uma tentativa errada.
  let restored = restoreSession(JSON.parse(JSON.stringify(saved)));
  assert.equal(restored.index, 0);
  assert.equal(sessionStats(restored).pending, 0);
  assert.equal(sessionScore(restored), 3);
  assert.equal(restored.questions['aladdin-8'].attemptsUsed, 1);
  for (let index = 0; index < 6; index += 1) {
    restored = applyAnswer(restored, restored.quiz[index].correctChoiceId!).session;
    restored = goToNext(restored, '2026-01-01T00:02:00.000Z');
    restored = restoreSession(JSON.parse(JSON.stringify(restored)));
  }
  assert.equal(restored.index, 7); // Q7 já foi respondida; segue para Q8.
  assert.equal(applyAnswer(restored, 'red').event.type, 'already_selected');
  restored = applyAnswer(restored, 'green').session;
  assert.equal(restored.questions['aladdin-8'].points, 2);
  assert.equal(sessionScore(restored), 23);
});

test('resultado antigo concluído permanece parcial, sem pontos ou senha retroativos', () => {
  let saved = createSession('p1', oldQuiz(), '2026-01-01T00:00:00.000Z', 1);
  for (const question of saved.quiz) {
    saved = question.correctChoiceId
      ? applyAnswer(saved, question.correctChoiceId).session
      : acknowledgeReview(saved, question.id);
    saved = goToNext(saved, '2026-01-01T00:01:00.000Z');
  }
  let restored = restoreSession(JSON.parse(JSON.stringify(saved)));
  restored = restoreSession(JSON.parse(JSON.stringify(restored)));
  assert.equal(restored.status, 'finished');
  assert.equal(sessionStats(restored).pending, 6);
  assert.equal(sessionStats(restored).maxScore, 72);
  assert.equal(sessionScore(restored), 72);
  assert.equal(passwordFor(restored), null);
});

test('atividades de observação, quebra-cabeça e sequências têm ilustração', () => {
  const catalog = ALADDIN_PROGRAMS.flatMap((program) => program.questions);
  const visualNumbers = [1, 2, 3, 4, 5, 6, 16, 17, 18,
    ...Array.from({ length: 8 }, (_, i) => 21 + i),
    ...Array.from({ length: 11 }, (_, i) => 34 + i),
    ...Array.from({ length: 16 }, (_, i) => 64 + i), 84,
    ...Array.from({ length: 6 }, (_, i) => 99 + i),
    ...Array.from({ length: 6 }, (_, i) => 121 + i),
    ...Array.from({ length: 6 }, (_, i) => 135 + i), 144, 145, 146];
  for (const number of visualNumbers) {
    const image = catalog.find((question) => question.number === number)?.illustration;
    assert.ok(image, `Questão ${number} precisa da figura original.`);
    assert.ok(image.width > 0 && image.height > 0 && image.description);
  }
  for (const number of [99, 100, 101, 102, 103, 104, 135, 136, 137, 138, 139, 140]) {
    assert.ok(catalog.find((question) => question.number === number)?.context);
  }
});

test('correções editoriais oferecem uma alternativa correspondente à figura ou ao fato', () => {
  const catalog = ALADDIN_PROGRAMS.flatMap((program) => program.questions);
  for (const [number, expected] of [[1, 'olhando'], [66, 'recife'], [75, 'B'], [77, 'F'], [133, '28 milhões de dólares'], [145, 'cantora'], [146, 'maestro'], [150, '90']] as const) {
    const question = catalog.find((item) => item.number === number)!;
    assert.equal(question.choices.find((choice) => choice.id === question.correctChoiceId)?.text, expected);
  }
});
