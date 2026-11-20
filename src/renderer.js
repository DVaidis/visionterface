// Visionterface — interface
const HOME = 'https://visio.numerique.gouv.fr/';
const MAX_RECENTS = 15;
const ROOM_RE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

const $ = (id) => document.getElementById(id);
const view = $('view');
let data = { links: [], settings: {} };
let editingId = null;
let lastClip = '';

// ---------- Utilitaires ----------
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Normalise un lien collé ou un code de réunion
function normalize(input) {
  let s = (input || '').trim();
  if (!s) return null;
  // Lien dans un texte (invitation copiée en entier)
  const m = s.match(/https?:\/\/[^\s<>"']+/i);
  if (m) s = m[0];
  if (/^https?:\/\//i.test(s)) {
    try { return new URL(s).toString(); } catch { return null; }
  }
  if (/^visio\.numerique\.gouv\.fr/i.test(s)) return 'https://' + s;
  if (ROOM_RE.test(s)) return HOME + s.toLowerCase();
  return null;
}
const isVisio = (u) => { try { return /(^|\.)numerique\.gouv\.fr$/i.test(new URL(u).hostname); } catch { return false; } };
// Code de salle Visio : 3-4-3 lettres (ex. abc-defg-hij)
const isRoom = (u) => { try { const x = new URL(u); return isVisio(u) && ROOM_RE.test(x.pathname.replace(/^\/|\/$/g, '')); } catch { return false; } };
const roomCode = (u) => { try { return new URL(u).pathname.replace(/^\/|\/$/g, ''); } catch { return u; } };
const sameRoom = (a, b) => { try { const x = new URL(a), y = new URL(b); return x.host === y.host && x.pathname.replace(/\/$/, '') === y.pathname.replace(/\/$/, ''); } catch { return a === b; } };

// ---------- Liens ----------
async function persist() { await window.visio.saveLinks(data.links); render(); }

function remember(url) {
  if (!isRoom(url)) return;
  let l = data.links.find(x => sameRoom(x.url, url));
  if (!l) { l = { id: uid(), name: '', url, pinned: false, count: 0 }; data.links.push(l); }
  l.lastUsed = Date.now(); l.count = (l.count || 0) + 1;
  // Limite des récents non nommés
  const rec = data.links.filter(x => !x.pinned).sort((a, b) => b.lastUsed - a.lastUsed);
  rec.slice(MAX_RECENTS).forEach(x => { data.links = data.links.filter(y => y !== x); });
  persist();
}

function render() {
  const q = $('filter').value.trim().toLowerCase();
  const match = (l) => !q || (l.name || '').toLowerCase().includes(q) || l.url.toLowerCase().includes(q);
  const item = (l) => `
    <li data-id="${l.id}" title="${esc(l.url)}">
      <div class="lk" data-act="open">
        <div class="nm">${esc(l.name || roomCode(l.url))}</div>
        <div class="sub">${l.name ? esc(roomCode(l.url)) + ' · ' : ''}${l.lastUsed ? new Date(l.lastUsed).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'fr-FR') : ''}</div>
      </div>
      <button class="ic" data-act="edit" title="${t('edit')}">✎</button>
      <button class="ic" data-act="copy" title="${t('copy')}">⧉</button>
      <button class="ic" data-act="del" title="${t('del')}">✕</button>
    </li>`;
  const favs = data.links.filter(l => l.pinned && match(l)).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));
  const recs = data.links.filter(l => !l.pinned && match(l)).sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  $('favs').innerHTML = favs.map(item).join('') || `<li class="empty">${t('noFavs')}</li>`;
  setTimeout(updateRoomUI, 0);
  $('recents').innerHTML = recs.map(item).join('') || `<li class="empty">${t('noRecents')}</li>`;
}

function onListClick(e) {
  const li = e.target.closest('li[data-id]'); if (!li) return;
  const l = data.links.find(x => x.id === li.dataset.id); if (!l) return;
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'open') go(l.url);
  if (act === 'edit') openLinkDialog(l);
  if (act === 'copy') navigator.clipboard?.writeText(l.url).catch(() => {});
  if (act === 'del' && confirm(t('delConfirm', l.name || roomCode(l.url)))) {
    data.links = data.links.filter(x => x !== l); persist();
  }
}
$('favs').addEventListener('click', onListClick);
$('recents').addEventListener('click', onListClick);
$('filter').addEventListener('input', render);

function openLinkDialog(l) {
  editingId = l ? l.id : null;
  $('dlgLinkTitle').textContent = l && l.name ? t('editLink') : t('nameLink');
  $('fName').value = l?.name || '';
  $('fUrl').value = l?.url || (isRoom(view.getURL()) ? view.getURL() : $('url').value);
  $('dlgLink').showModal();
  $('fName').focus();
}
$('dlgLink').addEventListener('close', () => {
  if ($('dlgLink').returnValue !== 'ok') return;
  const url = normalize($('fUrl').value); const name = $('fName').value.trim();
  if (!url || !name) return;
  let l = editingId ? data.links.find(x => x.id === editingId) : data.links.find(x => sameRoom(x.url, url));
  if (!l) { l = { id: uid(), count: 0, lastUsed: Date.now() }; data.links.push(l); }
  Object.assign(l, { name, url, pinned: true });
  persist();
});

// ---------- Navigation ----------
function go(input) {
  const url = normalize(input);
  if (!url) { flash(t('badLink')); return; }
  if (!isVisio(url) && !confirm(t('notVisio', url))) return;
  view.loadURL(url);
}
$('btnGo').onclick = () => go($('url').value);
$('url').addEventListener('keydown', (e) => { if (e.key === 'Enter') go($('url').value); });
$('url').addEventListener('focus', () => $('url').select());
$('btnHome').onclick = () => view.loadURL(HOME);
$('btnReload').onclick = () => view.reload();
$('btnSave').onclick = () => openLinkDialog(data.links.find(x => sameRoom(x.url, view.getURL())) || null);
$('btnToggleSide').onclick = () => document.body.classList.toggle('noside');

// ---------- Réunion en cours : bandeau + rappel dans la barre latérale ----------
function roomName(url) {
  const l = data.links.find(x => sameRoom(x.url, url));
  return (l && l.name) || '';
}
function updateRoomUI() {
  let cur = '';
  try { cur = view.getURL(); } catch {}  // la webview n'est pas forcément prête
  const active = isRoom(cur);
  const last = data.settings.lastRoom;
  // Bandeau en haut : nom en grand
  if (active) {
    const n = roomName(cur);
    $('nowName').textContent = n || roomCode(cur);
    $('nowCode').textContent = n ? roomCode(cur) : '';
    $('nowBar').classList.remove('hidden');
  } else $('nowBar').classList.add('hidden');
  // Carte à gauche : toujours un bouton Rejoindre pour la réunion en cours / la dernière
  const url = active ? cur : last;
  if (!url) { $('roomCard').classList.add('hidden'); return; }
  const n = roomName(url);
  $('rcLabel').textContent = active ? t('rcActive') : t('rcIdle');
  $('rcName').textContent = n || roomCode(url);
  $('rcCode').textContent = n ? roomCode(url) : url.replace(/^https?:\/\//, '');
  $('rcJoin').dataset.url = url;
  $('roomCard').classList.toggle('idle', !active);
  $('roomCard').classList.remove('hidden');
}
$('rcJoin').onclick = () => { const u = $('rcJoin').dataset.url; if (u) view.loadURL(u); };
$('rcClear').onclick = async () => {
  data.settings = await window.visio.setSettings({ lastRoom: '' });
  updateRoomUI();
};

function onNav(url) {
  if (document.activeElement !== $('url')) $('url').value = url;
  const active = isRoom(url);
  window.visio.meetingActive(active);
  setStatus(active ? 'room' : 'ok');
  if (active) {
    remember(url);
    if (data.settings.lastRoom !== url) window.visio.setSettings({ lastRoom: url }).then(s => { data.settings = s; });
    data.settings.lastRoom = url;
  }
  updateRoomUI();
}
view.addEventListener('did-navigate', (e) => onNav(e.url));
view.addEventListener('did-navigate-in-page', (e) => { if (e.isMainFrame) onNav(e.url); });

// ---------- Maintien de la connexion ----------
let retry = 0;
view.addEventListener('did-fail-load', (e) => {
  if (!e.isMainFrame || e.errorCode === -3) return; // -3 = navigation annulée
  setStatus('off');
  const delay = Math.min(30000, 2000 * 2 ** retry++);
  setTimeout(() => { if (navigator.onLine) view.reload(); }, delay);
});
view.addEventListener('did-finish-load', () => { retry = 0; });
view.addEventListener('crashed', () => setTimeout(() => view.reload(), 1500));
window.addEventListener('offline', () => setStatus('off'));
window.addEventListener('online', () => {
  setStatus(isRoom(view.getURL()) ? 'room' : 'ok');
  // Si la page avait échoué pendant la coupure, on la recharge
  view.executeJavaScript('document.body ? document.body.innerText.length : 0')
    .then(n => { if (!n) view.reload(); }).catch(() => view.reload());
});

function setStatus(s) {
  const st = $('status');
  st.className = s;
  st.title = { ok: t('stOk'), room: t('stRoom'), off: t('stOff') }[s] || '';
}
function flash(msg) {
  const u = $('url'); const old = u.placeholder;
  u.value = ''; u.placeholder = '⚠ ' + msg; u.classList.add('err');
  setTimeout(() => { u.placeholder = old; u.classList.remove('err'); }, 2500);
}

// ---------- Presse-papiers ----------
async function checkClipboard() {
  if (data.settings.clipboardHint === false) return;
  try {
    const t = (await window.visio.readClipboard() || '').trim();
    if (!t || t === lastClip) return;
    lastClip = t;
    const u = normalize(t);
    if (u && isRoom(u) && !sameRoom(u, view.getURL())) {
      $('clipUrl').textContent = roomCode(u);
      $('clipHint').dataset.url = u;
      $('clipHint').classList.remove('hidden');
    }
  } catch {}
}
window.addEventListener('focus', checkClipboard);
$('clipGo').onclick = () => { go($('clipHint').dataset.url); $('clipHint').classList.add('hidden'); };
$('clipNo').onclick = () => $('clipHint').classList.add('hidden');

// ---------- Partage d'écran ----------
window.visio.onPickSource((list) => {
  const box = $('sources');
  box.innerHTML = list.map(s => `
    <button class="src" data-id="${esc(s.id)}">
      <img src="${s.thumb}" alt=""><span>${esc(s.name)}</span>
    </button>`).join('');
  box.onclick = (e) => {
    const b = e.target.closest('.src'); if (!b) return;
    window.visio.sourcePicked(b.dataset.id, $('shareAudio').checked);
    $('dlgShare').close('picked');
  };
  $('dlgShare').showModal();
});
$('shareCancel').onclick = () => $('dlgShare').close('cancel');
$('dlgShare').addEventListener('close', () => {
  if ($('dlgShare').returnValue !== 'picked') window.visio.sourcePicked(null, false);
});

// ---------- Réglages / crédits ----------
$('btnPin').onclick = async () => {
  const s = await window.visio.setSettings({ alwaysOnTop: !data.settings.alwaysOnTop });
  data.settings = s; $('btnPin').classList.toggle('on', !!s.alwaysOnTop);
};
$('btnSettings').onclick = () => {
  $('sKeep').checked = data.settings.keepSessionCookies !== false;
  $('sClip').checked = data.settings.clipboardHint !== false;
  $('sAuto').checked = data.settings.autoCheck !== false;
  $('dlgSettings').showModal();
};
$('sKeep').onchange = async () => { data.settings = await window.visio.setSettings({ keepSessionCookies: $('sKeep').checked }); };
$('sClip').onchange = async () => { data.settings = await window.visio.setSettings({ clipboardHint: $('sClip').checked }); };
$('sLogout').onclick = async () => {
  if (!confirm(t('logoutConfirm'))) return;
  await window.visio.logout(); view.loadURL(HOME); $('dlgSettings').close();
};
$('btnCredits').onclick = () => $('dlgCredits').showModal();
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-ext]'); if (!a) return;
  e.preventDefault(); window.visio.openExternal(a.dataset.ext);
});
$('btnLang').onclick = async () => {
  LANG = LANG === 'fr' ? 'en' : 'fr';
  data.settings = await window.visio.setSettings({ lang: LANG });
  applyI18n(); render(); renderVersions(); updateRoomUI(); setStatus($('status').className || 'ok');
};

window.visio.onOpenUrl((u) => go(u));

// ---------- Versions des composants ----------
let local = null, lastCheck = null;
const BADGE = {
  ok: ['b-ok', 'sOk'], supported: ['b-ok', 'sSupported'], minor: ['b-warn', 'sMinor'],
  obsolete: ['b-bad', 'sObsolete'], unknown: ['b-unk', 'sUnknown'], update: ['b-warn', 'sUpdate'],
  norepo: ['b-unk', 'sNoRepo'], bundled: ['b-unk', 'sBundled'], info: ['b-unk', 'sInfo']
};
const badge = (s) => { const [c, k] = BADGE[s] || BADGE.unknown; return `<span class="badge ${c}">${esc(t(k))}</span>`; };
function renderVersions() {
  if (!local) return;
  document.querySelectorAll('.appver').forEach(el => { el.textContent = local.app; });
  const e = (lastCheck && lastCheck.electron) || { status: 'unknown' };
  const a = (lastCheck && lastCheck.app) || { status: local.repo ? 'unknown' : 'norepo' };
  const bundled = e.status === 'unknown' ? 'unknown' : (e.status === 'ok' || e.status === 'supported' ? 'bundled' : e.status);
  const rows = [
    ['Visionterface', local.app, a.latest || '', a.status],
    ['Electron', local.electron, e.latest || '', e.status],
    ['Chromium', local.chrome, e.latestChrome || '', bundled],
    ['Node.js', local.node, e.latestNode || '', bundled],
    ['V8', local.v8, '', bundled],
    [t('wOs'), local.os, '', 'info']
  ];
  $('vBody').innerHTML = rows.map(([n, v, l, s]) =>
    `<tr><td>${esc(n)}</td><td>${esc(v)}</td><td>${esc(l)}</td><td>${badge(s)}</td></tr>`).join('');
  $('vChecked').textContent = lastCheck ? t('vChecked', new Date(lastCheck.checkedAt).toLocaleString(LANG === 'en' ? 'en-GB' : 'fr-FR')) : t('vNever');
  $('vDownload').classList.toggle('hidden', !(a.status === 'update' && a.url));
  $('vDownload').dataset.url = a.url || '';
  // Alerte : pastille + bandeau
  const problem = a.status === 'update' || e.status === 'obsolete' || e.status === 'minor';
  $('verDot').classList.toggle('hidden', !problem);
  let msg = '';
  if (a.status === 'update') msg = t('updApp', a.latest);
  else if (e.status === 'obsolete') msg = t('updObsolete');
  else if (e.status === 'minor') msg = t('updMinor');
  const dismissedKey = msg + '|' + (a.latest || '') + '|' + (e.latest || '');
  const appUpd = a.status === 'update';
  $('updGo').classList.toggle('hidden', !appUpd);
  $('updNews').classList.toggle('hidden', !appUpd);
  $('updGo').textContent = a.canSelfUpdate ? t('updRestart') : t('updDownload');
  $('updShow').classList.toggle('hidden', appUpd);
  if (updBusy) return;
  if (msg && data.settings.updDismissed !== dismissedKey) {
    $('updText').textContent = msg; $('updHint').dataset.key = dismissedKey; $('updHint').classList.remove('hidden');
  } else $('updHint').classList.add('hidden');
}
$('btnVersions').onclick = () => { renderVersions(); $('dlgVersions').showModal(); };

// ---------- Mise à jour du logiciel ----------
let updBusy = false;
$('updGo').onclick = async () => {
  const a = (lastCheck && lastCheck.app) || {};
  updBusy = true; $('updGo').disabled = true;
  try {
    const r = await window.visio.installUpdate();
    if (r && r.mode === 'download') { $('updText').textContent = t('updMacHint'); updBusy = false; $('updGo').disabled = false; }
    else $('updText').textContent = t('updApplying');
  } catch (e) {
    updBusy = false; $('updGo').disabled = false;
    $('updText').textContent = t('updFailed', (e && e.message || String(e)).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''));
  }
};
window.visio.onUpdateProgress((p) => { $('updText').textContent = t('updProgress', p); });
$('updNews').onclick = () => openHelp('tNext');

// ---------- Aide et journal des modifications ----------
let changelog = [];
function renderChangelog() {
  const cur = local ? local.app : '';
  $('tLog').innerHTML = changelog.map(v => `
    <h4>${esc(v.version)}${v.version === cur ? `<span class="cur">${esc(t('curVersion'))}</span>` : ''} <small>— ${esc(v.date || '')}</small></h4>
    <ul>${((v[LANG] || v.fr) || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('');
  const a = (lastCheck && lastCheck.app) || {};
  const hasNext = a.status === 'update';
  $('tabNext').classList.toggle('hidden', !hasNext);
  $('tNext').innerHTML = hasNext
    ? `<h4>${esc(a.latest)}</h4><div class="notes">${esc(a.notes || t('noNotes'))}</div>`
    : '';
}
function openHelp(tab) {
  renderChangelog();
  document.querySelectorAll('#dlgHelp .tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  document.querySelectorAll('#dlgHelp .tpane').forEach(p => p.classList.toggle('hidden', p.id !== tab));
  if (!$('dlgHelp').open) $('dlgHelp').showModal();
}
document.querySelectorAll('#dlgHelp .tab').forEach(b => b.onclick = () => openHelp(b.dataset.tab));
$('btnHelp').onclick = () => openHelp('tHelp');
$('vCheck').onclick = async () => {
  $('vCheck').disabled = true; $('vChecked').textContent = t('vChecking');
  try { lastCheck = await window.visio.checkVersions(); } catch {}
  $('vCheck').disabled = false; renderVersions();
};
$('vDownload').onclick = () => { const u = $('vDownload').dataset.url; if (u) window.visio.openExternal(u); };
$('updShow').onclick = () => { renderVersions(); $('dlgVersions').showModal(); };
$('updNo').onclick = async () => {
  $('updHint').classList.add('hidden');
  data.settings = await window.visio.setSettings({ updDismissed: $('updHint').dataset.key || '' });
};
window.visio.onVersions((res) => { lastCheck = res; renderVersions(); });
$('sAuto').onchange = async () => { data.settings = await window.visio.setSettings({ autoCheck: $('sAuto').checked }); };

// ---------- Démarrage ----------
(async () => {
  data = await window.visio.getData();
  data.links = data.links || []; data.settings = data.settings || {};
  LANG = data.settings.lang || 'fr';
  applyI18n();
  $('btnPin').classList.toggle('on', !!data.settings.alwaysOnTop);
  render(); setStatus(navigator.onLine ? 'ok' : 'off');
  try { local = await window.visio.localVersions(); } catch {}
  try { changelog = await window.visio.getChangelog(); } catch {}
  lastCheck = data.settings.lastCheck || null;
  renderVersions(); updateRoomUI();
  checkClipboard();
})();
