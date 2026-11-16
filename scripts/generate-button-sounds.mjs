// Original, deterministic bell tones for the app. Run: node scripts/generate-button-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../assets/audios/effects/', import.meta.url));
const sampleRate = 44100;
mkdirSync(output, { recursive: true });

function writeBell(name, notes, duration) {
  const count = Math.ceil(duration * sampleRate);
  const wav = Buffer.alloc(44 + count * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); // PCM, mono, 16-bit.
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(count * 2, 40);

  for (let i = 0; i < count; i++) {
    const time = i / sampleRate;
    let sample = 0;
    for (const [frequency, start, gain] of notes) {
      const t = time - start;
      if (t < 0) continue;
      const attack = Math.min(t / 0.004, 1);
      const fade = Math.min((duration - time) / 0.025, 1);
      const body = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 16);
      const shimmer = 0.22 * Math.sin(2 * Math.PI * frequency * 2 * t) * Math.exp(-t * 32);
      sample += (body + shimmer) * attack * fade * gain;
    }
    wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample * 0.48)) * 32767), 44 + i * 2);
  }
  writeFileSync(`${output}/${name}.wav`, wav);
  console.log(`${name}.wav: ${Math.round(duration * 1000)} ms, ${wav.length} bytes`);
}

// A shared D-major palette suggests a small magical chime and an electronic toy.
writeBell('tap', [[880, 0, 0.7], [1174.66, 0.035, 0.45]], 0.26);
writeBell('back', [[880, 0, 0.65], [587.33, 0.04, 0.6]], 0.26);
writeBell('red', [[587.33, 0, 1]], 0.22);
writeBell('yellow', [[659.25, 0, 1]], 0.22);
writeBell('blue', [[739.99, 0, 1]], 0.22);
writeBell('green', [[880, 0, 1]], 0.22);
