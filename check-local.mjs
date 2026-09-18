// Runner de validation locale : contourne la redirection PowerShell qui avale
// stderr (logs UTF-16 vides). Lance tsc puis vitest et affiche tout en clair.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

function run(label, fullCommand, logFile) {
  console.log(`\n=== ${label} : ${fullCommand} ===`);
  const result = spawnSync(fullCommand, { encoding: 'utf8', shell: true });
  const output = `STDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}\nSTATUS: ${result.status}\nERROR: ${result.error?.message ?? 'none'}`;
  console.log(output);
  if (logFile) writeFileSync(logFile, output, 'utf8');
  console.log(`--- ${label} exit: ${result.status} ---`);
  return result.status ?? 1;
}

const target = process.argv[2] ?? 'all';
if (target === 'all' || target === 'build') {
  const build = run('BUILD', 'npm.cmd --prefix engine run build', 'build-out.log');
  if (build !== 0) process.exit(build);
  if (target === 'build') process.exit(0);
}
if (target === 'all' || target === 'test') {
  process.exit(run('TEST', 'npm.cmd --prefix engine run test -- --run --reporter=verbose', 'test-out.log'));
}
const file = target.startsWith('file:') ? target.slice(5) : target;
process.exit(run(`TEST ${file}`, `npm.cmd --prefix engine run test -- --run --reporter=verbose ${file}`, 'test-out.log'));