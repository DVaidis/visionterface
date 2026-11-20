// Vérifie s'il existe une version plus récente d'Electron et, si oui, prépare une nouvelle version
// de Visionterface (numéro +0.0.1, package.json, journal des modifications).
// Utilisé par .github/workflows/electron-update.yml. Écrit ses résultats dans $GITHUB_OUTPUT.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const pkgFile = path.join(root, 'package.json');
const logFile = path.join(root, 'src', 'changelog.json');
const allowMajor = String(process.env.ALLOW_MAJOR || '').toLowerCase() === 'true';

const cmp = (a, b) => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
};
const out = (k, v) => {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
  console.log(`${k}=${v}`);
};

const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
const current = String(pkg.devDependencies.electron).replace(/^[\^~]/, '');
const curMajor = Number(current.split('.')[0]);
const all = JSON.parse(execSync('npm view electron versions --json', { encoding: 'utf8' }))
  .filter(v => /^\d+\.\d+\.\d+$/.test(v));
const sameMajor = all.filter(v => Number(v.split('.')[0]) === curMajor).sort(cmp);
const newest = all.slice().sort(cmp).pop();
const target = allowMajor ? newest : sameMajor.pop();
const newestMajor = Number(newest.split('.')[0]);
out('current', current);
out('newest', newest);
out('major_available', !allowMajor && newestMajor > curMajor ? String(newestMajor) : '');

if (!target || cmp(target, current) <= 0) { out('updated', 'false'); process.exit(0); }

// Prochain numéro de version : dernier tag vX.Y.Z (ou package.json) + 0.0.1
let tags = [];
try { tags = execSync('git tag --list "v*"', { encoding: 'utf8' }).split(/\r?\n/).map(s => s.replace(/^v/, '')).filter(v => /^\d+\.\d+\.\d+$/.test(v)); } catch {}
const logged = JSON.parse(fs.readFileSync(logFile, 'utf8')).map(e => e.version).filter(v => /^\d+\.\d+\.\d+$/.test(v));
const base = [pkg.version, ...tags, ...logged].sort(cmp).pop();
const [M, m, p] = base.split('.').map(Number);
const next = `${M}.${m}.${p + 1}`;

pkg.version = next;
pkg.devDependencies.electron = '^' + target;
fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');

const log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
log.unshift({
  version: next,
  date: new Date().toISOString().slice(0, 10),
  fr: [`Mise à jour automatique du moteur Electron : ${current} → ${target} (correctifs de sécurité de Chromium et Node.js).`],
  en: [`Automatic Electron engine update: ${current} → ${target} (Chromium and Node.js security fixes).`]
});
fs.writeFileSync(logFile, JSON.stringify(log, null, 2) + '\n');

out('updated', 'true');
out('target', target);
out('version', next);
out('tag', 'v' + next);
