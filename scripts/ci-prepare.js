// Préparation automatique sur GitHub Actions :
// - numéro de version de l'application = tag de la Release (ex. v1.0.1 -> 1.0.1)
// - dépôt GitHub utilisé pour la détection des nouvelles versions = ce dépôt
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
const repo = process.env.GITHUB_REPOSITORY || '';
const tag = (process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || '').trim();
const m = tag.match(/^v?(\d+\.\d+\.\d+)$/) || tag.match(/^v?(\d+\.\d+)$/);
if (m) pkg.version = m[1].split('.').length === 2 ? m[1] + '.0' : m[1];
if (repo) {
  pkg.visionterface = Object.assign({}, pkg.visionterface, { githubRepo: repo });
  pkg.repository = { type: 'git', url: `https://github.com/${repo}.git` };
}
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`version=${pkg.version} repo=${repo || '(aucun)'}`);
