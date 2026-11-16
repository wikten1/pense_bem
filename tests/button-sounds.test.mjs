import assert from 'node:assert/strict';
import test from 'node:test';

import { replayButtonSound } from '../src/services/replayButtonSound.ts';

const flush = () => new Promise((resolve) => setImmediate(resolve));

test('Android waits for the seek and replays an ended sound on every tap', async () => {
  const calls = [];
  let finishSeek;
  const player = {
    isLoaded: false, // Native Android reports false after STATE_ENDED.
    seekTo(position) {
      calls.push(['seek', position]);
      return new Promise((resolve) => { finishSeek = resolve; });
    },
    play() { calls.push(['play']); },
  };
  const errors = [];
  for (let tap = 0; tap < 3; tap++) {
    replayButtonSound(player, true, () => true, (error) => errors.push(error));
    assert.equal(calls.filter(([action]) => action === 'play').length, tap);
    finishSeek();
    await flush();
    assert.equal(calls.filter(([action]) => action === 'play').length, tap + 1);
  }
  assert.deepEqual(calls, [['seek', 0], ['play'], ['seek', 0], ['play'], ['seek', 0], ['play']]);
  assert.deepEqual(errors, []);
});

test('a pending native seek cannot play after mute or background cancels it', async () => {
  let allowed = true;
  let finishSeek;
  let playCount = 0;
  const player = {
    seekTo: () => new Promise((resolve) => { finishSeek = resolve; }),
    play: () => { playCount++; },
  };
  replayButtonSound(player, true, () => allowed, assert.fail);
  allowed = false;
  finishSeek();
  await flush();
  assert.equal(playCount, 0);
});

test('web starts inside the gesture without waiting for an asynchronous seek', () => {
  let played = false;
  const player = {
    seekTo: () => new Promise(() => {}),
    play: () => { played = true; },
  };
  replayButtonSound(player, false, () => true, assert.fail);
  assert.equal(played, true);
});

test('native seek failures are reported without playing or rejecting the button action', async () => {
  const failure = new Error('seek failed');
  const errors = [];
  let played = false;
  const player = {
    seekTo: () => Promise.reject(failure),
    play: () => { played = true; },
  };
  assert.doesNotThrow(() => replayButtonSound(player, true, () => true, (error) => errors.push(error)));
  await flush();
  assert.equal(played, false);
  assert.deepEqual(errors, [failure]);
});
