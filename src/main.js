// Visionterface — client de bureau non officiel pour visio.numerique.gouv.fr
// Licence MIT — D. C. Vaidis
const {
  app, BrowserWindow, session, ipcMain, shell, desktopCapturer,
  powerSaveBlocker, dialog, Menu, clipboard, net, systemPreferences
} = require('electron');
const IS_MAC = process.platform === 'darwin';
const path = require('path');
const fs = require('fs');
const os = require('os');
const pkg = require('../package.json');
// Dépôt GitHub pour la détection des nouvelles versions ("utilisateur/depot"), défini dans package.json
const UPDATE_REPO = ((pkg.visionterface && pkg.visionterface.githubRepo) || '').trim();

const HOME = 'https://visio.numerique.gouv.fr/';
const PARTITION = 'persist:visio';
// Domaines autorisés dans la fenêtre (Visio + authentification ProConnect / fournisseurs d'identité gouv.)
const ALLOWED_HOST = /(^|\.)((numerique\.)?gouv\.fr|proconnect\.gouv\.fr|agentconnect\.gouv\.fr)$/i;

let win = null;
let psbId = null;          // blocage de la mise en veille pendant une réunion
let quitting = false;

// ---------- Stockage local (liens nommés + réglages) ----------
const dataFile = () => path.join(app.getPath('userData'), 'visio-data.json');
function loadData() {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); }
  catch { return { links: [], settings: { keepSessionCookies: true, alwaysOnTop: false } }; }
}
function saveData(d) {
  fs.mkdirSync(path.dirname(dataFile()), { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify(d, null, 2), 'utf8');
}
// Reprise des données de l'ancien nom (Visio Desktop) : liens + session
(function migrate() {
  try {
    const nu = app.getPath('userData');
    for (const old of ['Visio Desktop', 'visio-desktop']) {
      const od = path.join(app.getPath('appData'), old);
      if (od === nu || !fs.existsSync(path.join(od, 'visio-data.json'))) continue;
      if (fs.existsSync(path.join(nu, 'visio-data.json'))) break;
      fs.mkdirSync(nu, { recursive: true });
      fs.copyFileSync(path.join(od, 'visio-data.json'), path.join(nu, 'visio-data.json'));
      const op = path.join(od, 'Partitions');
      if (fs.existsSync(op)) fs.cpSync(op, path.join(nu, 'Partitions'), { recursive: true });
      break;
    }
  } catch (e) { console.error('migration', e); }
})();
let data = loadData();
data.settings = Object.assign({ keepSessionCookies: true, alwaysOnTop: false }, data.settings || {});

// ---------- Une seule instance ----------
if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on('second-instance', (_e, argv) => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
  const url = argv.find(a => /^https?:\/\//i.test(a));
  if (url) win.webContents.send('open-url', url);
});

// ---------- Session persistante ----------
function setupSession() {
  const ses = session.fromPartition(PARTITION);

  // User-Agent sans le marqueur "Electron" (certains sites le refusent)
  ses.setUserAgent(ses.getUserAgent().replace(/\s?Electron\/\S+/, '').replace(/\s?visio-desktop\/\S+/i, ''));

  // Caméra, micro, notifications, plein écran : accordés pour les domaines autorisés
  const okPerms = new Set(['media', 'display-capture', 'notifications', 'fullscreen',
    'clipboard-sanitized-write', 'clipboard-read', 'speaker-selection', 'idle-detection']);
  ses.setPermissionRequestHandler(async (wc, perm, cb, details) => {
    let host = '';
    try { host = new URL(details.requestingUrl || wc.getURL()).hostname; } catch {}
    if (!(okPerms.has(perm) && ALLOWED_HOST.test(host))) return cb(false);
    // macOS : demander l'autorisation système caméra / micro (fenêtre de macOS au premier usage)
    if (IS_MAC && perm === 'media') {
      try {
        const types = details.mediaTypes || [];
        if (types.includes('video')) await systemPreferences.askForMediaAccess('camera');
        if (types.includes('audio')) await systemPreferences.askForMediaAccess('microphone');
      } catch {}
    }
    cb(true);
  });
  ses.setPermissionCheckHandler((_wc, perm, origin) => {
    let host = '';
    try { host = new URL(origin).hostname; } catch {}
    return okPerms.has(perm) && ALLOWED_HOST.test(host);
  });

  // Partage d'écran : sélecteur maison (écrans + fenêtres), son système sous Windows
  ses.setDisplayMediaRequestHandler(async (_req, callback) => {
    // macOS : le partage d'écran exige l'autorisation « Enregistrement de l'écran »
    if (IS_MAC && systemPreferences.getMediaAccessStatus('screen') === 'denied') {
      const en = data.settings.lang === 'en';
      const r = await dialog.showMessageBox(win, {
        type: 'info',
        buttons: en ? ['Open settings', 'Cancel'] : ['Ouvrir les réglages', 'Annuler'], defaultId: 0, cancelId: 1,
        message: en ? 'Screen sharing is blocked by macOS.' : 'Le partage d\'écran est bloqué par macOS.',
        detail: en ? 'Allow Visionterface in System Settings > Privacy & Security > Screen Recording, then restart the app.'
                   : 'Autorisez Visionterface dans Réglages Système > Confidentialité et sécurité > Enregistrement de l\'écran, puis relancez l\'application.'
      });
      if (r.response === 0) shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
      return callback({});
    }
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'], thumbnailSize: { width: 320, height: 180 }
      });
      const list = sources.map(s => ({ id: s.id, name: s.name, thumb: s.thumbnail.toDataURL() }));
      win.webContents.send('pick-source', list);
      ipcMain.once('source-picked', (_e, id, withAudio) => {
        const src = sources.find(s => s.id === id);
        if (!src) return callback({});
        const res = { video: src };
        if (withAudio && process.platform === 'win32') res.audio = 'loopback';
        callback(res);
      });
    } catch (e) { callback({}); }
  });
  return ses;
}

// Les cookies « de session » (sans date d'expiration) sont effacés à la fermeture.
// Option : on les transforme en cookies persistants (30 j) pour rester connecté.
async function persistSessionCookies() {
  if (!data.settings.keepSessionCookies) return;
  const ses = session.fromPartition(PARTITION);
  const cookies = await ses.cookies.get({});
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  for (const c of cookies) {
    if (!c.session) continue;
    // Partition dédiée à Visio : on garde aussi les cookies du fournisseur d'identité (ex. université)
    const host = c.domain.replace(/^\./, '');
    const det = {
      url: (c.secure ? 'https://' : 'http://') + host + (c.path || '/'),
      name: c.name, value: c.value, path: c.path, secure: c.secure,
      httpOnly: c.httpOnly, expirationDate: exp
    };
    if (!c.hostOnly) det.domain = c.domain;
    if (c.sameSite && c.sameSite !== 'unspecified') det.sameSite = c.sameSite;
    try { await ses.cookies.set(det); } catch {}
  }
  try { await ses.cookies.flushStore(); } catch {}
}

// ---------- Versions et vérification automatique ----------
function cmpVer(a, b) {
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
async function getJSON(url) {
  const r = await net.fetch(url, { headers: { 'User-Agent': 'Visionterface', 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
function localVersions() {
  return {
    app: app.getVersion(), electron: process.versions.electron, chrome: process.versions.chrome,
    node: process.versions.node, v8: process.versions.v8,
    os: `${os.type()} ${os.release()} (${process.arch})`, repo: UPDATE_REPO
  };
}
async function checkVersions() {
  const res = { checkedAt: Date.now(), electron: null, app: null };
  // Electron (et donc Chromium / Node / V8 intégrés) : seules les 3 dernières versions majeures sont maintenues
  try {
    const rel = await getJSON('https://releases.electronjs.org/releases.json');
    const stable = rel.filter(r => r && r.version && !String(r.version).includes('-'));
    const major = v => parseInt(String(v).split('.')[0], 10);
    const majors = [...new Set(stable.map(r => major(r.version)))].sort((a, b) => b - a);
    const supported = majors.slice(0, 3);
    const cur = process.versions.electron, curMajor = major(cur);
    const newestOf = m => stable.filter(r => major(r.version) === m).map(r => r.version).sort(cmpVer).pop();
    const latest = newestOf(majors[0]);
    const latestInMajor = newestOf(curMajor) || cur;
    const entry = stable.find(r => r.version === latest) || {};
    let status;
    if (!supported.includes(curMajor)) status = 'obsolete';
    else if (cmpVer(cur, latestInMajor) < 0) status = 'minor';
    else status = curMajor === majors[0] ? 'ok' : 'supported';
    res.electron = { status, latest, latestChrome: entry.chrome || '', latestNode: entry.node || '', supported };
  } catch (e) { res.electron = { status: 'unknown', error: String(e.message || e) }; }
  // Visionterface : dernière Release GitHub
  if (!UPDATE_REPO) res.app = { status: 'norepo' };
  else {
    try {
      const j = await getJSON(`https://api.github.com/repos/${UPDATE_REPO}/releases/latest`);
      const tag = String(j.tag_name || '').replace(/^v/i, '');
      const asset = (re) => {
        const a = (j.assets || []).find(x => re.test(x.name));
        return a ? { name: a.name, url: a.browser_download_url, size: a.size } : null;
      };
      res.app = {
        latest: tag, url: j.html_url, notes: String(j.body || ''),
        status: cmpVer(app.getVersion(), tag) >= 0 ? 'ok' : 'update',
        win: asset(/-Windows\.zip$/i), mac: asset(/-Mac\.dmg$/i),
        canSelfUpdate: canSelfUpdate()
      };
    } catch (e) { res.app = { status: 'unknown', error: String(e.message || e) }; }
  }
  data.settings.lastCheck = res; saveData(data);
  if (win && !win.isDestroyed()) win.webContents.send('versions:result', res);
  return res;
}
function scheduleChecks() {
  const run = () => { if (data.settings.autoCheck !== false) checkVersions().catch(() => {}); };
  setTimeout(run, 8000);                       // peu après le démarrage
  setInterval(run, 24 * 3600 * 1000);          // puis une fois par jour
}

// ---------- Mise à jour de Visionterface ----------
// Windows (version installée par Install.bat) : téléchargement du zip de la Release, puis un petit
// script PowerShell attend la fermeture de l'application, remplace ses fichiers et la relance.
// macOS (application non signée) : ouverture du .dmg dans le navigateur.
function canSelfUpdate() {
  return process.platform === 'win32' && app.isPackaged &&
    path.basename(process.execPath).toLowerCase() === 'visionterface.exe';
}
async function downloadTo(url, file, expectedSize, onProgress) {
  const { Readable } = require('stream');
  const r = await net.fetch(url, { headers: { 'User-Agent': 'Visionterface' } });
  if (!r.ok || !r.body) throw new Error('HTTP ' + r.status);
  const total = Number(r.headers.get('content-length')) || expectedSize || 0;
  let done = 0;
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(file);
    const src = Readable.fromWeb(r.body);
    src.on('data', (c) => { done += c.length; if (total) onProgress(Math.round(done * 100 / total)); });
    src.on('error', reject); out.on('error', reject); out.on('finish', resolve);
    src.pipe(out);
  });
  if (expectedSize && fs.statSync(file).size !== expectedSize) throw new Error('taille incorrecte');
}
async function installUpdate() {
  const info = data.settings.lastCheck && data.settings.lastCheck.app;
  if (!info || info.status !== 'update') throw new Error('Aucune mise à jour disponible');
  if (!canSelfUpdate()) {
    const target = (IS_MAC ? info.mac : info.win) || { url: info.url };
    shell.openExternal(target.url);
    return { mode: 'download' };
  }
  if (!info.win) throw new Error('Fichier Windows absent de la Release');
  const dir = path.join(app.getPath('temp'), 'visionterface-update');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const zip = path.join(dir, info.win.name);
  await downloadTo(info.win.url, zip, info.win.size, (p) => {
    if (win && !win.isDestroyed()) win.webContents.send('update:progress', p);
  });
  const installDir = path.dirname(process.execPath);
  const ps1 = path.join(dir, 'apply-update.ps1');
  const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
  fs.writeFileSync(ps1, [
    '$ErrorActionPreference = "Continue"',
    `$zip = ${q(zip)}; $tmp = ${q(path.join(dir, 'x'))}; $dest = ${q(installDir)}`,
    `try { Wait-Process -Id ${process.pid} -Timeout 60 -ErrorAction SilentlyContinue } catch {}`,
    'Start-Sleep -Seconds 1',
    'try {',
    '  Expand-Archive -Path $zip -DestinationPath $tmp -Force',
    '  $src = Join-Path $tmp "Visionterface"',
    '  if (Test-Path (Join-Path $src "Visionterface.exe")) { robocopy $src $dest /MIR /R:3 /W:1 /NJH /NJS /NDL /NFL /NP | Out-Null }',
    '} catch {}',
    'Start-Process -FilePath (Join-Path $dest "Visionterface.exe")',
    ''
  ].join('\r\n'), 'utf8');
  await persistSessionCookies();
  const { spawn } = require('child_process');
  spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ps1],
    { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  quitting = true;
  setTimeout(() => app.exit(0), 300);
  return { mode: 'restart' };
}
function readChangelog() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'changelog.json'), 'utf8')); }
  catch { return []; }
}

// ---------- Fenêtre ----------
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 720, minHeight: 480,
    title: 'Visionterface',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#f5f5fe',
    alwaysOnTop: !!data.settings.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      backgroundThrottling: false   // pas de ralentissement quand la fenêtre est en arrière-plan
    }
  });
  // Windows : pas de menu. macOS : menu minimal indispensable (Cmd+C / Cmd+V / Cmd+Q…)
  Menu.setApplicationMenu(IS_MAC
    ? Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }])
    : null);
  win.loadFile(path.join(__dirname, 'index.html'));
  // La fenêtre principale ne quitte jamais l'interface locale : liens externes → navigateur
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) { e.preventDefault(); if (/^https:\/\//i.test(url)) shell.openExternal(url); }
  });

  win.on('close', async (e) => {
    if (quitting) return;
    e.preventDefault();
    if (psbId !== null) {
      const r = await dialog.showMessageBox(win, {
        type: 'question', defaultId: 1, cancelId: 1,
        ...(data.settings.lang === 'en'
          ? { buttons: ['Quit', 'Cancel'], title: 'Meeting in progress', message: 'A meeting seems to be in progress. Quit anyway?' }
          : { buttons: ['Quitter', 'Annuler'], title: 'Réunion en cours', message: 'Une réunion semble en cours. Quitter quand même ?' })
      });
      if (r.response !== 0) return;
    }
    quitting = true;
    await persistSessionCookies();
    app.quit();
  });
}

// Sécurise la <webview> : pas de Node, pas de preload étranger
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (_ev, webPreferences, params) => {
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.backgroundThrottling = false;
    params.partition = PARTITION;
  });
  if (contents.getType() === 'webview') {
    contents.setWindowOpenHandler(({ url }) => {
      let host = '';
      try { host = new URL(url).hostname; } catch {}
      if (ALLOWED_HOST.test(host)) contents.loadURL(url);
      else shell.openExternal(url);
      return { action: 'deny' };
    });
    // Rechargement automatique si la page plante
    contents.on('render-process-gone', () => {
      setTimeout(() => { try { contents.reload(); } catch {} }, 1500);
    });
  }
});

// ---------- IPC ----------
ipcMain.handle('data:get', () => data);
ipcMain.handle('versions:local', () => localVersions());
ipcMain.handle('versions:check', () => checkVersions());
ipcMain.handle('update:install', () => installUpdate());
ipcMain.handle('changelog:get', () => readChangelog());
ipcMain.handle('links:save', (_e, links) => { data.links = links; saveData(data); return true; });
ipcMain.handle('settings:set', (_e, s) => {
  data.settings = Object.assign(data.settings, s); saveData(data);
  if (win && 'alwaysOnTop' in s) win.setAlwaysOnTop(!!s.alwaysOnTop);
  return data.settings;
});
ipcMain.handle('meeting:active', (_e, active) => {
  if (active && psbId === null) psbId = powerSaveBlocker.start('prevent-display-sleep');
  if (!active && psbId !== null) { powerSaveBlocker.stop(psbId); psbId = null; }
  return active;
});
ipcMain.handle('session:logout', async () => {
  const ses = session.fromPartition(PARTITION);
  await ses.clearStorageData();
  return true;
});
ipcMain.handle('clipboard:read', () => clipboard.readText());
ipcMain.handle('open-external', (_e, url) => {
  if (/^https:\/\//i.test(url)) shell.openExternal(url);
});

// Test de démarrage automatique (GitHub Actions) : l'interface doit se charger, puis on quitte.
const SMOKE = process.argv.includes('--smoke-test');
if (SMOKE) {
  setTimeout(() => { console.error('SMOKE TEST: délai dépassé'); app.exit(1); }, 45000);
  app.on('browser-window-created', (_e, w) => {
    w.webContents.once('did-finish-load', () => {
      w.webContents.executeJavaScript("!!document.getElementById('btnVersions') && typeof t === 'function'")
        .then(ok => { console.log('SMOKE TEST: ' + (ok ? 'OK' : 'ECHEC')); app.exit(ok ? 0 : 1); })
        .catch(e => { console.error('SMOKE TEST: ' + e); app.exit(1); });
    });
  });
}

app.whenReady().then(() => {
  setupSession();
  createWindow();
  if (!SMOKE) scheduleChecks();
  // Lien passé en argument (ex. raccourci) : ouvert au démarrage
  const url = process.argv.find(a => /^https?:\/\//i.test(a));
  if (url) win.webContents.once('did-finish-load', () => win.webContents.send('open-url', url));
});
app.on('window-all-closed', () => app.quit());
