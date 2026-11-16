const { execFileSync } = require('node:child_process');
const { createWriteStream } = require('node:fs');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const path = require('node:path');

const buildId = 'dd9a0f90-79e7-4e6d-8be4-c744251832b6';
const output = path.join(__dirname, 'pense-bem-musica07.apk');

async function main() {
  for (let attempt = 0; attempt < 45; attempt++) {
    const raw = execFileSync('cmd.exe', ['/d', '/s', '/c', `npx.cmd eas-cli@latest build:view ${buildId} --json`], {
      encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000,
    });
    const build = JSON.parse(raw);
    console.log(new Date().toISOString(), build.status);
    if (build.logFiles?.length) {
      const response = await fetch(build.logFiles.at(-1));
      if (response.ok) {
        const lines = (await response.text()).split('\n');
        console.log(lines.filter(line => /> Task|Starting phase|Finished phase|BUILD SUCCESSFUL|BUILD FAILED/.test(line))
          .slice(-2).map(line => line.slice(0, 250)).join('\n'));
      }
    }
    if (build.status === 'FINISHED') {
      const url = build.artifacts.applicationArchiveUrl || build.artifacts.buildUrl;
      console.log('APK_URL', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`APK download: HTTP ${response.status}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(output));
      console.log('APK_FILE', output);
      return;
    }
    if (['ERRORED', 'CANCELED'].includes(build.status)) throw new Error(`Build ${build.status}`);
    await new Promise(resolve => setTimeout(resolve, 40000));
  }
  throw new Error('Build still running after 30 minutes');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
