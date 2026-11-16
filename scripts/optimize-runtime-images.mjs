import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Original PNGs remain available for the artwork tools. Only smaller, pixel-identical
// derivatives are referenced by the app. Run again after changing source artwork.
const components = ['src/components/game/question-illustration.tsx', 'src/components/game/program-screen.tsx'];
const checkOnly = process.argv.includes('--check');
const report = [];
for (const component of components) {
  let code = await readFile(component, 'utf8');
  const sources = [...code.matchAll(/require\('([^']+\.(?:png|lossless\.webp))'\)/g)];
  for (const [, reference] of sources) {
    if (checkOnly && reference.endsWith('.png')) continue;
    // Existing WebP illustrations have a separate editorial pipeline.
    const original = path.resolve(path.dirname(component), reference.replace(/\.lossless\.webp$/, '.png'));
    let input;
    try { input = await readFile(original); } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    const destination = original.replace(/\.png$/, '.lossless.webp');
    const output = checkOnly ? await readFile(destination) : await sharp(input).webp({ lossless: true, effort: 6 }).toBuffer();
    const before = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const after = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual(after.info, before.info, original);
    assert.ok(after.data.equals(before.data), `Pixels changed: ${original}`);
    if (output.length >= input.length) {
      code = code.replace(`require('${reference}')`, `require('${reference.replace(/\.lossless\.webp$/, '.png')}')`);
      continue;
    }
    if (!checkOnly) await writeFile(destination, output);
    code = code.replace(`require('${reference}')`, `require('${reference.replace(/\.png$/, '.lossless.webp')}')`);
    report.push({ source: path.relative(process.cwd(), original), output: path.relative(process.cwd(), destination), before: input.length, after: output.length, pixelsIdentical: true });
  }
  if (!checkOnly) await writeFile(component, code);
}
if (!checkOnly) await writeFile('docs/runtime-images.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ images: report.length, before: report.reduce((n, row) => n + row.before, 0), after: report.reduce((n, row) => n + row.after, 0), pixelsIdentical: true }));
