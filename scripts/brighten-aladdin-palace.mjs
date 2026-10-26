import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Only remap existing pixel luminance. No synthesis, geometric changes or
// local painted details: preserve the sunset and expose the shadow contours.
const directory = new URL('../artwork/aladdin-restored/', import.meta.url);
const manifestPath = new URL('restoration-manifest.json', directory);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const record = manifest.images.find(({ id }) => id === 'palace');
assert.ok(!record.replacement, 'Palace now uses a user-selected replacement; do not overwrite it with the old lighting revision.');
const sourcePath = new URL('palace-dark-v1.png', directory);
const source = await readFile(sourcePath);
const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
assert.equal(info.channels, 3);
const anchors = [[0, 0], [8, 30], [16, 58], [32, 90], [64, 124], [96, 151], [128, 172], [192, 217], [255, 255]];
function exposedLuminance(value) {
  const index = anchors.findIndex(([x]) => x >= value);
  if (index <= 0) return 0;
  const [x0, y0] = anchors[index - 1];
  const [x1, y1] = anchors[index];
  return y0 + (value - x0) * (y1 - y0) / (x1 - x0);
}
for (let i = 0; i < data.length; i += 3) {
  const luminance = .2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2];
  // Protect the already luminous sunset and water from a grey/washed cast.
  const brightestChannel = Math.max(data[i], data[i + 1], data[i + 2]);
  const highlight = Math.min(1, Math.max(0, (brightestChannel - 110) / 125));
  const protection = 1 - highlight * highlight * (3 - 2 * highlight);
  const lift = (exposedLuminance(luminance) - luminance) * protection;
  for (let channel = 0; channel < 3; channel++) {
    data[i + channel] = Math.min(255, Math.max(0, Math.round(data[i + channel] + lift)));
  }
}
const result = await sharp(data, { raw: info }).png().toBuffer();
await writeFile(new URL('palace.png', directory), result);
record.sha256 = createHash('sha256').update(result).digest('hex');
record.method = 'reference-constrained digital redraw with pixel-only shadow exposure correction';
record.lightingRevision = {
  source: 'artwork/aladdin-restored/palace-dark-v1.png',
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  script: 'scripts/brighten-aladdin-palace.mjs',
  luminanceAnchors: anchors,
  highlightProtection: 'Smooth fade for maximum RGB channel between 110 and 235; preserve the luminous sunset.',
  review: 'Existing foreground contours made visible; no new faces, objects or drawn details. Same dimensions and geometry.',
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Palace exposure corrected: ${info.width}x${info.height}; original archived.`);
