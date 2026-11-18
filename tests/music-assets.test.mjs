import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(
  readFileSync(new URL('../src/services/music-assets.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const catalogs = Object.fromEntries(['music-catalog.ts', 'music-catalog.android.ts'].map((file) => [file,
  ts.transpileModule(readFileSync(new URL(`../src/services/${file}`, import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
]));
const flush = () => new Promise((resolve) => setImmediate(resolve));

function loadService(platform, download, fetch) {
  const exports = {};
  const assets = new Map();
  const context = {
    exports,
    require(name) {
      if (name === 'react-native') return { Platform: { OS: platform } };
      if (name === 'expo-asset') return { Asset: { fromModule: (id) => assets.get(id) } };
      if (name === './music-catalog') return catalog;
      const id = assets.size + 1;
      assets.set(id, { uri: `https://app.test/${id}.mp3`, localUri: `file://${id}.mp3`, downloadAsync: () => download(id) });
      return id;
    },
    fetch,
    URL: { createObjectURL: (blob) => `blob:${blob}` },
  };
  const catalog = {};
  vm.runInNewContext(catalogs[platform === 'android' ? 'music-catalog.android.ts' : 'music-catalog.ts'], { ...context, exports: catalog });
  vm.runInNewContext(compiled, context);
  return exports;
}

test('startup waits for the last music file and shares in-flight downloads', async () => {
  const finish = new Map();
  const service = loadService('android', (id) => new Promise((resolve) => finish.set(id, resolve)));
  let ready = false;
  const first = service.loadMusicAssets().then((assets) => { ready = true; return assets; });
  const second = service.loadMusicAssets();
  assert.equal(finish.size, 8);
  for (const [id, resolve] of finish) if (id !== 8) resolve();
  await flush();
  assert.equal(ready, false);
  finish.get(8)();
  const [assets, shared] = await Promise.all([first, second]);
  assert.equal(ready, true);
  assert.equal(assets.size, 8);
  assert.equal(shared.get(8).uri, 'file://8.mp3');
});

test('a failed music blocks startup and retry reuses the successful downloads', async () => {
  const calls = [];
  let fail = true;
  const service = loadService('ios', async (id) => {
    calls.push(id);
    if (id === 3 && fail) throw new Error('offline');
  });
  await assert.rejects(service.loadMusicAssets(), /offline/);
  fail = false;
  const assets = await service.loadMusicAssets();
  assert.equal(assets.size, 8);
  assert.deepEqual(calls, [1, 2, 3, 4, 5, 6, 7, 8, 3]);
});

test('web waits for complete response bodies and plays from cached blob URLs', async () => {
  const finish = [];
  const service = loadService('web', assert.fail, async () => ({
    ok: true,
    blob: () => new Promise((resolve) => finish.push(resolve)),
  }));
  let ready = false;
  const loading = service.loadMusicAssets().then((assets) => { ready = true; return assets; });
  await flush();
  assert.equal(finish.length, 8);
  assert.equal(ready, false);
  finish.forEach((resolve, index) => resolve(`music-${index}`));
  const assets = await loading;
  assert.equal(assets.get(service.menuSource).uri, 'blob:music-0');
});

test('web HTTP failures reject loading instead of marking music as ready', async () => {
  const service = loadService('web', assert.fail, async () => ({ ok: false, status: 503 }));
  await assert.rejects(service.loadMusicAssets(), /503/);
});
