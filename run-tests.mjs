// Capture propre des tests : sortie UTF-8 lisible, sans redirect PowerShell.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const cwd = 'c:/Users/willi/OneDrive/Bureau/sept-princes-jeu/engine';
let out = '';
try {
  out = execSync('npx vitest run --reporter=basic', { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
} catch (error) {
  out = String(error.stdout ?? '') + String(error.stderr ?? '');
}
const lines = out.split(/\r?\n/).filter((line) => line.trim().length > 0);
const interesting = lines.filter((line) => /FAIL|AssertionError|expected|✓|×|Tests |Test Files|❯|passed|failed/.test(line));
writeFileSync('c:/Users/willi/OneDrive/Bureau/sept-princes-jeu/test-out.log', interesting.join('\n'), 'utf8');
console.log('CAPTURED', interesting.length, 'lines');
