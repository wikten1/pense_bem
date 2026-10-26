import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'artwork/aladdin-restored');
const output = path.join(root, 'assets/images/questions/aladdin');
const crops = JSON.parse(await readFile(new URL('./aladdin-illustrations.json', import.meta.url), 'utf8'));
const approvals = JSON.parse(await readFile(path.join(source, 'restoration-manifest.json'), 'utf8'));
assert.equal(approvals.images.length, crops.length, 'Every illustration needs a reviewed master.');
const pdfArgument = process.argv.indexOf('--pdf');
const pdf = await readFile(path.resolve(root, pdfArgument >= 0 ? process.argv[pdfArgument + 1] : approvals.source));
assert.equal(createHash('sha256').update(pdf).digest('hex'), approvals.sourceSha256, 'The reviewed masters belong to a different source PDF.');
await mkdir(output, { recursive: true });
const records = [];
for (const crop of crops) {
  const { id, width, height, scale } = crop;
  const approval = approvals.images.find((image) => image.id === id);
  assert.ok(approval?.reviewed, `Unreviewed master: ${id}`);
  const master = await readFile(path.join(source, `${id}.png`));
  const sha256 = (data) => createHash('sha256').update(data).digest('hex');
  assert.equal(sha256(master), approval.sha256, `Master changed after review: ${id}`);
  let prepared = master;
  if (approval.paddingCrop) {
    // Some very wide outputs contain additional white padding. Remove only
    // that reviewed extra padding; never crop the source artwork itself.
    prepared = await sharp(master).extract(approval.paddingCrop).png().toBuffer();
  }
  const background = approval.background ?? '#ffffff';
  const data = await sharp(prepared).flatten({ background })
    .resize(width * scale, height * scale, { fit: 'contain', background, kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 94, effort: 6, smartSubsample: true }).toBuffer();
  const metadata = await sharp(data).metadata();
  assert.equal(metadata.width * height, metadata.height * width, `Aspect ratio mismatch: ${id}`);
  await writeFile(path.join(output, `${id}.webp`), data);
  records.push({ id, width: metadata.width, height: metadata.height, bytes: data.length, sha256: sha256(data),
    master: `artwork/aladdin-restored/${id}.png`, method: approval.method });
  console.log(`${id}: ${metadata.width}x${metadata.height}, ${data.length} bytes`);
}
const report = { method: 'reviewed digital restoration masters, exported as WebP quality 94',
  source: approvals.source, sourceSha256: approvals.sourceSha256,
  count: records.length, totalBytes: records.reduce((sum, image) => sum + image.bytes, 0), images: records };
await writeFile(path.join(output, 'enhancement-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Total: ${report.count} images, ${report.totalBytes} bytes.`);
