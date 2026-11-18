import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ffmpeg = process.env.MUSIC_FFMPEG || 'ffmpeg';
const folder = join('assets', 'audios');
const output = join(folder, 'optimized');
const tracks = [
  ['musica_aladin', 'musica_aladin'],
  ['livro01', 'livro01'], ['livro02', 'livro02'], ['livro03', 'livro03'],
  ['livro04', 'livro04'], ['livro05', 'livro05'],
  ['musica 07', 'musica_07'], ['musica 08', 'musica_08'],
];

mkdirSync(output, { recursive: true });
for (const [input, name] of tracks) {
  for (const [extension, codec] of [['ogg', 'libopus'], ['m4a', 'aac']]) {
    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', join(folder, `${input}.mp3`),
      '-vn', '-map_metadata', '-1', '-ac', '2', '-c:a', codec, '-b:a', '96k'];
    if (extension === 'm4a') args.push('-movflags', '+faststart');
    args.push(join(output, `${name}.${extension}`));
    process.stdout.write(`Converting ${input} to ${extension}...\n`);
    const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
