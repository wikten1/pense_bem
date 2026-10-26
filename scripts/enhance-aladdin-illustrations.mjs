import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const pdfPath = path.resolve(root, option('--pdf', 'assets/pdfs/pense_bem_-_disney_-_aladdin_em_os_misterios_do_oriente.pdf'));
const output = path.resolve(root, option('--output', 'assets/images/questions/aladdin'));
const preview = args.includes('--preview');
const lossless = args.includes('--lossless');
const only = option('--only', null);
const crops = JSON.parse(await readFile(new URL('./aladdin-illustrations.json', import.meta.url), 'utf8'));
const pdf = await readFile(pdfPath);
const latin = pdf.toString('latin1');
const pages = [];
// This particular scan has exactly one DCT/JPEG image per PDF page. Work from
// those streams, never from the recompressed game JPEGs or a previous upscale.
const imagePattern = /\d+ 0 obj\s*<<[^]*?\/Subtype \/Image[^]*?\/Length (\d+)[^]*?>>\s*stream\r?\n/g;
let match;
while ((match = imagePattern.exec(latin))) {
  const start = imagePattern.lastIndex;
  const end = start + Number(match[1]);
  const page = pdf.subarray(start, end);
  assert.equal(page.readUInt16BE(0), 0xffd8, 'Expected a scanned JPEG page.');
  pages.push(page);
  imagePattern.lastIndex = end;
}
assert.equal(pages.length, 36, 'Unexpected scan: expected 36 pages.');
assert.equal(new Set(crops.map(({ id }) => id)).size, 23);
await mkdir(output, { recursive: true });
if (preview) await mkdir(path.join(output, 'review'), { recursive: true });

// Very mild bilateral filtering, guided by luminance. Strong edges and small
// lettering do not mix with their background. Apply a common RGB offset so
// local chroma is preserved; there is no colour grading or white balancing.
function denoiseLuminance(data, width, height, strength) {
  const luminance = new Float32Array(width * height);
  for (let i = 0; i < luminance.length; i++) {
    luminance[i] = data[i * 3] * 0.2126 + data[i * 3 + 1] * 0.7152 + data[i * 3 + 2] * 0.0722;
  }
  const result = Buffer.from(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let weighted = 0;
      let weights = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const neighbour = luminance[ny * width + nx];
          const difference = neighbour - luminance[i];
          const weight = Math.exp(-(dx * dx + dy * dy) / 2 - difference * difference / 72);
          weighted += neighbour * weight;
          weights += weight;
        }
      }
      const offset = (weighted / weights - luminance[i]) * strength;
      for (let channel = 0; channel < 3; channel++) {
        result[i * 3 + channel] = Math.max(0, Math.min(255, Math.round(data[i * 3 + channel] + offset)));
      }
    }
  }
  return result;
}

const records = [];
for (const crop of crops.filter(({ id }) => !only || id === only)) {
  const { id, page, left, top, width, height, scale } = crop;
  assert.ok(scale === 2 || scale === 4);
  const source = await sharp(pages[page - 1]).extract({ left, top, width, height }).removeAlpha().toColourspace('srgb').raw().toBuffer();
  const softScene = id === 'palace' || id === 'characters';
  const denoised = denoiseLuminance(source, width, height, softScene ? 0.15 : 0.25);
  const enhanced = await sharp(denoised, { raw: { width, height, channels: 3 } })
    .resize({ width: width * scale, height: height * scale, fit: 'fill', kernel: sharp.kernel.cubic })
    .sharpen({ sigma: softScene ? 0.65 : 0.8, m1: 0, m2: softScene ? 0.5 : 0.8, x1: 3, y2: 2, y3: 2 })
    .raw().toBuffer();
  const encoded = await sharp(enhanced, { raw: { width: width * scale, height: height * scale, channels: 3 } })
    .webp(lossless ? { lossless: true, effort: 6 } : { quality: 94, effort: 6, smartSubsample: true, smartDeblock: true })
    .toBuffer();
  const metadata = await sharp(encoded).metadata();
  assert.equal(metadata.width, width * scale);
  assert.equal(metadata.height, height * scale);
  assert.equal(metadata.width * height, metadata.height * width, `Distorted aspect ratio: ${id}`);
  const downsampled = await sharp(encoded).resize(width, height, { kernel: sharp.kernel.lanczos3, fastShrinkOnLoad: false }).removeAlpha().raw().toBuffer();
  const interpolated = await sharp(source, { raw: { width, height, channels: 3 } })
    .resize(width * scale, height * scale, { kernel: sharp.kernel.cubic }).png().toBuffer();
  const baseline = await sharp(interpolated).resize(width, height, { kernel: sharp.kernel.lanczos3, fastShrinkOnLoad: false }).raw().toBuffer();
  let error = 0;
  let baselineError = 0;
  const colorShift = [0, 0, 0];
  for (let i = 0; i < source.length; i++) {
    const delta = downsampled[i] - source[i];
    error += Math.abs(delta);
    baselineError += Math.abs(baseline[i] - source[i]);
    colorShift[i % 3] += delta / (width * height);
  }
  const meanAbsoluteError = error / source.length;
  const interpolationMeanAbsoluteError = baselineError / source.length;
  // Dense lettering already changes slightly in an unfiltered resize round trip.
  // Compare to that baseline instead of treating interpolation error as damage.
  assert.ok(meanAbsoluteError < interpolationMeanAbsoluteError + 1.5, `Excessive round-trip change: ${id}`);
  assert.ok(colorShift.every((delta) => Math.abs(delta) < 1.5), `Colour drift: ${id}`);
  await writeFile(path.join(output, `${id}.webp`), encoded);
  if (preview) {
    const original = await sharp(source, { raw: { width, height, channels: 3 } }).png().toBuffer();
    await writeFile(path.join(output, 'review', `${id}-source.png`), original);
    // Equal-sized panels: unfiltered interpolation of the scan versus the
    // processed asset. Keep this independent of previously generated files.
    const comparison = await sharp({ create: { width: width * scale * 2, height: height * scale, channels: 3, background: 'white' } })
      .composite([{ input: interpolated, left: 0, top: 0 }, { input: encoded, left: width * scale, top: 0 }]).png().toBuffer();
    await writeFile(path.join(output, 'review', `${id}-comparison.png`), comparison);
  }
  records.push({ id, page, crop: { left, top, width, height }, scale, width: metadata.width, height: metadata.height,
    bytes: encoded.length, sha256: createHash('sha256').update(encoded).digest('hex'),
    roundTripMeanAbsoluteError: Number(meanAbsoluteError.toFixed(4)), interpolationMeanAbsoluteError: Number(interpolationMeanAbsoluteError.toFixed(4)),
    meanRgbShift: colorShift.map((value) => Number(value.toFixed(4))) });
  console.log(`${id}: ${width}x${height} -> ${metadata.width}x${metadata.height} (${scale}x), ${encoded.length} bytes`);
}
const report = {
  source: path.relative(root, pdfPath).replaceAll('\\', '/'),
  sourceSha256: createHash('sha256').update(pdf).digest('hex'),
  processor: `sharp ${sharp.versions.sharp} / libvips ${sharp.versions.vips}`,
  method: { denoise: 'mild luminance-guided 3x3 bilateral', upscale: 'bicubic', sharpen: 'limited luminance sharpening',
    output: lossless ? 'lossless WebP' : 'WebP quality 94, smart subsampling and deblocking', generative: false },
  count: records.length, totalBytes: records.reduce((sum, image) => sum + image.bytes, 0), images: records,
};
await writeFile(path.join(output, 'enhancement-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Total: ${report.count} images, ${report.totalBytes} bytes.`);
