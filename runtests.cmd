@echo off
cd /d C:\Users\willi\OneDrive\Bureau\sept-princes-jeu\engine
call .\node_modules\.bin\vitest.cmd run --pool=forks --no-file-parallelism --reporter=json --outputFile=..\tj.json
cd ..
node -e "const r=require('./tj.json');const out=['FAILED:'+r.numFailedTests+' PASSED:'+r.numPassedTests];for(const f of r.testResults){for(const a of f.assertionResults){if(a.status==='failed'){out.push('- '+a.fullName);out.push('   '+String((a.failureMessages||[]).join(' ')).replace(/\s+/g,' ').slice(0,260))}}}require('fs').writeFileSync('sum.txt',out.join('\n'))"