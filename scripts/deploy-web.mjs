import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Compile a public, pinned source commit in Vercel without a GitHub App connection.
const repository = 'https://github.com/wikten1/pense_bem.git';
const project = 'pense-bem';
const scope = 'wiktenalves-4190s-projects';
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Commit inválido.');

const buildScript = `import { spawnSync } from 'node:child_process';
import { mkdtempSync, cpSync } from 'node:fs';
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const source = mkdtempSync('app-source-');
run('git', ['init', source]);
run('git', ['remote', 'add', 'origin', '${repository}'], source);
run('git', ['fetch', '--depth=1', 'origin', '${sha}'], source);
run('git', ['checkout', '--detach', 'FETCH_HEAD'], source);
run('npm', ['ci', '--no-audit', '--no-fund'], source);
run('npm', ['run', 'build:web'], source);
cpSync(source + '/dist', 'dist', { recursive: true });
`;

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const body = {
  name: project,
  project,
  target: 'production',
  projectSettings: { framework: null, buildCommand: 'npm run build:web', outputDirectory: 'dist', nodeVersion: '24.x' },
  meta: { sourceRepository: repository.replace(/\.git$/, ''), sourceCommit: sha },
  files: [
    { file: 'package.json', data: JSON.stringify({ name: 'pense-bem-public-deploy', version: '1.0.0', private: true, scripts: { 'build:web': 'node build-from-public-repo.mjs' } }), encoding: 'utf-8' },
    { file: 'vercel.json', data: JSON.stringify(config), encoding: 'utf-8' },
    { file: 'build-from-public-repo.mjs', data: buildScript, encoding: 'utf-8' },
  ],
};

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ project, scope, sourceCommit: sha, files: body.files.map(({ file }) => file) }, null, 2));
  process.exit(0);
}

if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) {
  throw new Error('Salve as alterações em um commit e envie ao GitHub antes de publicar.');
}

console.log(`Publicando o commit ${sha} no projeto ${project} (${scope}).`);
const args = ['--yes', 'vercel@latest', 'api', '/v13/deployments', '--method', 'POST', '--input', '-', '--scope', scope, '--raw'];
// cmd.exe resolves npx.cmd on Windows; arguments and stdin contain no credentials.
const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npx.cmd', ...args] : args;
const result = spawnSync(command, commandArgs, { input: JSON.stringify(body), encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
const deployment = JSON.parse(result.stdout);
console.log(JSON.stringify({ id: deployment.id, status: deployment.readyState, url: `https://${deployment.url}`, aliases: deployment.alias, sourceCommit: sha }, null, 2));
