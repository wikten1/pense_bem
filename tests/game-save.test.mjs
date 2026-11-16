import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acknowledgeReview, applyAnswer, buildQuiz, createPassword, createSession, goToNext,
  notaDesafio, redeemPassword, sessionStats,
} from '../src/game/rules.ts';
import { emptySave, readSave, serializeSave, toHistory } from '../src/storage/game-save.ts';

const startedAt = '2026-01-01T00:00:00.000Z';
const finishedAt = '2026-01-01T00:05:00.000Z';
const sessionFor = (id) => createSession(id, buildQuiz(id, 123), startedAt, 123);

test('compact saves resume every program after each answer and preserve results', () => {
  for (const id of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'practice']) {
    let session = sessionFor(id);
    for (const question of session.quiz) {
      const wrong = question.choices.find((choice) => choice.id !== question.correctChoiceId).id;
      session = applyAnswer(session, wrong).session;
      session = readSave(serializeSave({ ...emptySave(), session })).session;
      assert.equal(applyAnswer(session, wrong).event.type, 'already_selected');
      session = applyAnswer(session, question.correctChoiceId).session;
      session = goToNext(session, finishedAt);
      session = readSave(serializeSave({ ...emptySave(), session })).session;
    }
    const data = { ...emptySave(), session, history: [toHistory(session)] };
    assert.deepEqual(readSave(serializeSave(data)), data);
    assert.equal(sessionStats(session).score, session.quiz.length * 2);
  }
});

test('legacy full saves migrate without changing history, attempts or redeemed codes', () => {
  let session = sessionFor('practice');
  for (const question of session.quiz) {
    session = applyAnswer(session, question.correctChoiceId).session;
    session = goToNext(session, finishedAt);
  }
  const ledger = redeemPassword(emptySave().ledger, createPassword(1, 60), (n) => `p${n}`).ledger;
  const data = { session, history: [toHistory(session)], ledger };
  assert.deepEqual(readSave(JSON.stringify(data)), data);
  assert.deepEqual(readSave(serializeSave(readSave(JSON.stringify(data)))), data);
});

test('historical missing answer keys stay partial through compact saves', () => {
  const quiz = buildQuiz('p1', 123).map((q, i) => i < 6 ? { ...q, correctChoiceId: null } : q);
  let session = createSession('p1', quiz, startedAt, 123);
  for (const question of quiz) {
    session = question.correctChoiceId ? applyAnswer(session, question.correctChoiceId).session : acknowledgeReview(session, question.id);
    session = goToNext(session, finishedAt);
  }
  const data = readSave(serializeSave({ ...emptySave(), session, history: [toHistory(session)] }));
  assert.equal(sessionStats(data.session).pending, 6);
  assert.equal(data.history[0].password, null);
  assert.deepEqual(readSave(serializeSave(data)), data);
});

test('corrupt progress is rejected instead of being silently overwritten', () => {
  for (const raw of ['', 'null', '[]', '{', '{"version":99}', JSON.stringify({ ...emptySave(), history: [null] })]) {
    assert.throws(() => readSave(raw));
  }
  assert.deepEqual(readSave(null), emptySave());
  assert.throws(() => readSave(JSON.stringify({ ...emptySave(), ledger: { codes: ['AL190309'] } })));
  const session = sessionFor('p6');
  session.seed = '123';
  assert.throws(() => readSave(JSON.stringify({ ...emptySave(), session })));
});

test('Nota Desafio is rebuilt from codes and ignores manipulated stored totals', () => {
  const data = emptySave();
  data.ledger = {
    codes: [createPassword(1, 60), createPassword(1, 90), createPassword(2, 30)],
    byProgram: { p1: { code: 'forged', score: 9000 } },
  };
  const restored = readSave(JSON.stringify(data));
  assert.equal(notaDesafio(restored.ledger), 120);
  assert.deepEqual(redeemPassword(restored.ledger, createPassword(1, 60), (n) => `p${n}`), { ok: false, reason: 'duplicate' });
});

test('history rejects inconsistent scores, dates, counts and passwords', () => {
  let session = sessionFor('practice');
  for (const question of session.quiz) {
    session = applyAnswer(session, question.correctChoiceId).session;
    session = goToNext(session, finishedAt);
  }
  const entry = toHistory(session);
  for (const change of [{ score: 100 }, { finishedAt: 'invalid' }, { correct: 1 }, { percent: 999 }, { password: createPassword(1, 9) }, { programId: 'missing' }]) {
    assert.throws(() => readSave(JSON.stringify({ ...emptySave(), history: [{ ...entry, ...change }] })));
  }
});

test('compact saves omit bundled content and are smaller without losing progress', () => {
  const data = { ...emptySave(), session: sessionFor('p1') };
  const compact = serializeSave(data);
  assert.ok(Buffer.byteLength(compact) < Buffer.byteLength(JSON.stringify(data)));
  assert.ok(!compact.includes('prompt') && !compact.includes('illustration'));
  assert.deepEqual(readSave(compact), data);
});
