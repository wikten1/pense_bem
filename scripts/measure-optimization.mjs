import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildQuiz, createSession } from '../src/game/rules.ts';
import { emptySave, serializeSave } from '../src/storage/game-save.ts';

async function androidExport(directory) {
  const metadata = JSON.parse(await readFile(path.join(directory, 'metadata.json'), 'utf8')).fileMetadata.android;
  const assets = [...new Map(metadata.assets.map((asset) => [asset.path, asset])).values()];
  const sizes = await Promise.all(assets.map(async (asset) => ({ ...asset, bytes: (await stat(path.join(directory, asset.path))).size })));
  return {
    bundleBytes: (await stat(path.join(directory, metadata.bundle))).size,
    assetBytes: sizes.reduce((n, asset) => n + asset.bytes, 0),
    assets: assets.length,
    fontBytes: sizes.filter((asset) => asset.ext === 'ttf').reduce((n, asset) => n + asset.bytes, 0),
    fonts: sizes.filter((asset) => asset.ext === 'ttf').length,
  };
}

const before = await androidExport(process.argv[2] ?? 'tmp/optimization-before');
const after = await androidExport(process.argv[3] ?? 'tmp/optimization-final');
const saves = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'practice'].map((programId) => {
  const session = createSession(programId, buildQuiz(programId, 123), '2026-01-01T00:00:00.000Z', 123);
  const data = { ...emptySave(), session };
  return { programId, beforeBytes: Buffer.byteLength(JSON.stringify(data)), afterBytes: Buffer.byteLength(serializeSave(data)) };
});
const report = {
  method: 'Uncompressed Android export files from metadata.json; same platform and production mode. Save fixtures: new session, seed 123, empty history/ledger. These are size measurements, not APK size, startup time, FPS or memory measurements.',
  before, after, saves,
};
await writeFile('docs/optimization-metrics.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
