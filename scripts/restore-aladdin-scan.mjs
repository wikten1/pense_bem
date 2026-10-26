// Non-generative restoration for illustrations whose generated redraw was not
// available or could not preserve the original. Every output pixel derives
// from the same source crop; no shapes, text or faces are synthesized.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import ImageTracer from 'imagetracerjs';

const id = process.argv[process.argv.indexOf('--id') + 1];
const crops = JSON.parse(await readFile(new URL('./aladdin-illustrations.json', import.meta.url), 'utf8'));
const crop = crops.find((item) => item.id === id);
assert.ok(crop, 'Specify a valid --id.');
const pdf = await readFile(new URL('../assets/pdfs/pense_bem_-_disney_-_aladdin_em_os_misterios_do_oriente.pdf', import.meta.url));
const text = pdf.toString('latin1');
const pattern = /\d+ 0 obj\s*<<[^]*?\/Subtype \/Image[^]*?\/Length (\d+)[^]*?>>\s*stream\r?\n/g;
const pages = [];
let match;
while ((match = pattern.exec(text))) {
  const end = pattern.lastIndex + Number(match[1]);
  pages.push(pdf.subarray(pattern.lastIndex, end));
  pattern.lastIndex = end;
}
assert.equal(pages.length, 36);
const { left, top, width, height, scale } = crop;
let pixels = await sharp(pages[crop.page - 1]).extract({ left, top, width, height }).removeAlpha().raw().toBuffer();
// Stronger edge-guided descreening than the previous mild upscale: similar
// colours average together, while high-contrast contours and labels stay put.
const neighbours = [];
for (let dy = -3; dy <= 3; dy++) {
  for (let dx = -3; dx <= 3; dx++) neighbours.push({ dx, dy, spatial: Math.exp(-(dx * dx + dy * dy) / 5.12) });
}
for (let pass = 0; pass < 2; pass++) {
  const filtered = Buffer.alloc(pixels.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const position = (y * width + x) * 3;
      let weights = 0;
      const sums = [0, 0, 0];
      for (const { dx, dy, spatial } of neighbours) {
        const nx = Math.max(0, Math.min(width - 1, x + dx));
        const ny = Math.max(0, Math.min(height - 1, y + dy));
        const neighbour = (ny * width + nx) * 3;
        let difference = 0;
        for (let channel = 0; channel < 3; channel++) difference += (pixels[position + channel] - pixels[neighbour + channel]) ** 2;
        const weight = spatial * Math.exp(-difference / (3 * 2 * 16 ** 2));
        weights += weight;
        for (let channel = 0; channel < 3; channel++) sums[channel] += pixels[neighbour + channel] * weight;
      }
      for (let channel = 0; channel < 3; channel++) filtered[position + channel] = Math.round(sums[channel] / weights);
    }
  }
  pixels = filtered;
}
const output = await sharp(pixels, { raw: { width, height, channels: 3 } })
  .modulate({ saturation: 1.16 }).linear(1.06, -4)
  .resize(width * scale, height * scale, { kernel: sharp.kernel.cubic })
  .sharpen({ sigma: 0.8, m1: 0, m2: 0.7, y2: 3, y3: 3 }).png().toBuffer();
if (process.argv.includes('--vector')) {
  const rgba = await sharp(pixels, { raw: { width, height, channels: 3 } })
    .modulate({ saturation: 1.16 }).linear(1.06, -4).ensureAlpha().raw().toBuffer();
  const svg = ImageTracer.imagedataToSVG({ width, height, data: new Uint8ClampedArray(rgba) }, {
    ltres: 0.25, qtres: 0.25, pathomit: 1, colorsampling: 2,
    numberofcolors: id === 'genie-sequence' ? 24 : 128,
    colorquantcycles: 5, mincolorratio: 0, layering: 0,
    strokewidth: 0.8, linefilter: false, roundcoords: 2,
    scale, viewbox: true, desc: false, blurradius: 0,
  });
  await writeFile(new URL(`../artwork/aladdin-restored/${id}.svg`, import.meta.url), svg);
  await writeFile(new URL(`../artwork/aladdin-restored/${id}.png`, import.meta.url),
    await sharp(Buffer.from(svg)).resize(width * scale, height * scale).png().toBuffer());
} else {
  await writeFile(new URL(`../artwork/aladdin-restored/${id}.png`, import.meta.url), output);
}
console.log(`Restored ${id} directly from the original scan, preserving its geometry.`);
