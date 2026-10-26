import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const report = JSON.parse(await readFile('assets/images/questions/aladdin/enhancement-report.json', 'utf8'));
const manifest = JSON.parse(await readFile('artwork/aladdin-restored/restoration-manifest.json', 'utf8'));
const crops = JSON.parse(await readFile('scripts/aladdin-illustrations.json', 'utf8'));
const sha = (data) => createHash('sha256').update(data).digest('hex');
for (const [file, before] of Object.entries(manifest.protectedFiles)) {
  assert.equal(sha(await readFile(file)), before, `Question/game/layout file changed: ${file}`);
}
const illustrations = await import('../src/content/aladdin-visuals.ts');
const { questions } = await import('../src/content/aladdin.ts');
assert.equal(questions.filter((question) => question.illustration).length, 66);
assert.deepEqual(report.images.map(({ id }) => id).sort(), Object.keys(illustrations.illustrationDetails).sort());
assert.equal(report.images.length, 23);
await mkdir('docs/screenshots', { recursive: true });

const label = (text, width = 300) => Buffer.from(`<svg width="${width}" height="28"><rect width="100%" height="100%" fill="white"/><text x="6" y="21" font-family="Arial" font-size="16">${text}</text></svg>`);
const tiles = [];
for (const [index, image] of report.images.entries()) {
  const file = `assets/images/questions/aladdin/${image.id}.webp`;
  const data = await readFile(file);
  assert.equal(sha(data), image.sha256);
  const meta = await sharp(data).metadata();
  assert.equal(meta.hasAlpha, false, `Unexpected transparent holes in ${image.id}`);
  const crop = crops.find(({ id }) => id === image.id);
  assert.equal(meta.width, crop.width * crop.scale);
  assert.equal(meta.height, crop.height * crop.scale);
  assert.equal(meta.width * crop.height, meta.height * crop.width);
  const x = index % 4 * 300;
  const y = Math.floor(index / 4) * 270;
  tiles.push({ input: label(image.id), left: x, top: y });
  tiles.push({ input: await sharp(data).resize(288, 238, { fit: 'inside' }).png().toBuffer(), left: x + 6, top: y + 28 });
}
await sharp({ create: { width: 1200, height: 1620, channels: 3, background: 'white' } }).composite(tiles)
  .png().toFile('docs/screenshots/aladdin-recriacao-todas.png');

const pdf = await readFile(manifest.source);
const text = pdf.toString('latin1');
const pattern = /\d+ 0 obj\s*<<[^]*?\/Subtype \/Image[^]*?\/Length (\d+)[^]*?>>\s*stream\r?\n/g;
const pages = [];
let match;
while ((match = pattern.exec(text))) {
  const end = pattern.lastIndex + Number(match[1]);
  pages.push(pdf.subarray(pattern.lastIndex, end));
  pattern.lastIndex = end;
}
const panels = [];
for (const [index, id] of ['palace', 'tiger-calm', 'puzzle', 'characters'].entries()) {
  const crop = crops.find((item) => item.id === id);
  const { left, top, width, height } = crop;
  const original = await sharp(pages[crop.page - 1]).extract({ left, top, width, height }).png().toBuffer();
  const restored = await readFile(`assets/images/questions/aladdin/${id}.webp`);
  for (const [side, data] of [original, restored].entries()) {
    const x = side * 480;
    const y = index * 350;
    panels.push({ input: label(`${id}: ${side ? 'digital' : 'original'}`, 480), left: x, top: y });
    panels.push({ input: await sharp(data).resize(470, 315, { fit: 'contain', background: 'white' }).png().toBuffer(), left: x + 5, top: y + 30 });
  }
}
await sharp({ create: { width: 960, height: 1400, channels: 3, background: 'white' } }).composite(panels)
  .jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile('docs/screenshots/aladdin-recriacao-comparacao.jpg');
console.log(`Verified 23 illustrations / 66 associations; protected content and game files unchanged; exact aspect ratios. Assets: ${report.totalBytes} bytes.`);
