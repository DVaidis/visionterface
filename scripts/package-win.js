// Construit le paquet Windows « à extraire puis Install.bat » (sans electron-builder).
// Usage : npm install puis  node scripts/package-win.js   -> out/Visionterface/
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
// Emplacement réel du moteur : require('electron') renvoie le chemin de electron.exe
let exe = '';
try { exe = require(path.join(root, 'node_modules', 'electron')); } catch (e) { console.error(String(e.message || e)); }
if (!exe || !fs.existsSync(exe)) {
  console.error('electron.exe introuvable : lancer « node node_modules/electron/install.js » après npm install.');
  process.exit(1);
}
const dist = path.dirname(exe);
console.log('Moteur Electron : ' + exe);
const out = path.join(root, 'out', 'Visionterface');
fs.rmSync(path.join(root, 'out'), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(dist, out, { recursive: true });
fs.renameSync(path.join(out, path.basename(exe)), path.join(out, 'Visionterface.exe'));
fs.rmSync(path.join(out, 'resources', 'default_app.asar'), { force: true });
const app = path.join(out, 'resources', 'app');
fs.mkdirSync(app, { recursive: true });
fs.cpSync(path.join(root, 'src'), path.join(app, 'src'), { recursive: true });
// package.json allégé (pas de dépendances de développement dans le paquet)
const slim = { name: pkg.name, productName: pkg.productName, version: pkg.version, description: pkg.description,
  main: pkg.main, author: pkg.author, license: pkg.license, visionterface: pkg.visionterface };
fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(slim, null, 2));
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, 'LICENSE-Visionterface.txt'));
fs.copyFileSync(path.join(root, 'build', 'icon.ico'), path.join(out, 'icon.ico'));
for (const f of ['Install.bat', 'Uninstall.bat', 'README.txt']) {
  fs.copyFileSync(path.join(root, 'distrib', f), path.join(out, f));
}
console.log('Paquet Windows prêt : ' + out + ' (version ' + pkg.version + ')');
