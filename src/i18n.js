// Visionterface — traductions FR / EN (UK)
const I18N = {
  fr: {
    helpBtn: '? Aide', helpTab: 'Aide', logTab: 'Nouveautés', nextTab: 'Prochaine version', whatsNew: 'Nouveautés',
    updRestart: 'Mettre à jour et redémarrer', updDownload: 'Télécharger la mise à jour',
    updProgress: (p) => `Téléchargement de la mise à jour… ${p} %`, updApplying: 'Installation… Visionterface va redémarrer.',
    updFailed: (e) => `Échec de la mise à jour : ${e}`, updMacHint: 'Ouvrez le .dmg téléchargé et glissez Visionterface dans Applications (remplacer).',
    curVersion: 'version installée', noNotes: 'Pas de notes pour cette version.',
    helpBody: `
      <h4>Rejoindre une réunion</h4>
      <ul><li>Collez dans la barre du haut un lien d'invitation, le texte entier de l'invitation ou un code (ex. <code>abc-defg-hij</code>), puis Entrée.</li>
      <li>La réunion en cours s'affiche en grand ; à gauche, le bouton <b>Rejoindre</b> permet d'y revenir si la fenêtre s'est mal ouverte.</li></ul>
      <h4>Liens enregistrés</h4>
      <ul><li>Les réunions rejointes vont dans <b>Récents</b> (15 maximum).</li>
      <li><b>★ Nommer</b> range la réunion dans <b>Favoris</b> avec un nom ; ✎ modifier, ⧉ copier, ✕ supprimer.</li></ul>
      <h4>Connexion</h4>
      <ul><li>La connexion ProConnect est conservée d'un lancement à l'autre (Réglages pour désactiver ou se déconnecter).</li>
      <li>Pastille en haut à droite : verte connecté, bleue en réunion, orange hors ligne (reconnexion automatique).</li></ul>
      <h4>Mises à jour</h4>
      <ul><li>Visionterface vérifie chaque jour s'il existe une nouvelle version. Un bandeau propose alors <b>Mettre à jour et redémarrer</b> (Windows) ou <b>Télécharger</b> (Mac).</li>
      <li><b>⟳ Versions</b> détaille les composants (Electron, Chromium, Node.js) et leur état.</li></ul>
      <h4>Confidentialité</h4>
      <ul><li>Liens et réglages restent sur cet ordinateur. Seules les vérifications de version contactent GitHub et releases.electronjs.org.</li></ul>`,
    versionsBtn: '⟳ Versions', nowLabel: 'En réunion :', details: 'Détails',
    rcActive: 'Réunion en cours', rcIdle: 'Dernière réunion', rcClear: 'Oublier',
    sAuto: 'Vérifier automatiquement les versions (au démarrage puis chaque jour)',
    versionsTitle: 'Versions des composants', vComp: 'Composant', vInst: 'Installée', vLatest: 'Dernière', vState: 'État',
    vNote: 'Chromium, Node.js et V8 sont intégrés à Electron : ils se mettent à jour avec une nouvelle version de Visionterface.',
    vCheckNow: 'Vérifier maintenant', vDownload: 'Télécharger la nouvelle version', vChecking: 'Vérification…',
    vChecked: (d) => `Dernière vérification : ${d}`, vNever: 'Pas encore vérifié.',
    sOk: 'À jour', sSupported: 'Maintenu', sMinor: 'Mise à jour conseillée', sObsolete: 'Obsolète', sUnknown: 'Inconnu (hors ligne ?)',
    sUpdate: 'Nouvelle version', sNoRepo: 'Dépôt non configuré', sInfo: '—', sBundled: 'Intégré (suit Electron)',
    updApp: (v) => `Nouvelle version de Visionterface disponible (${v}).`,
    updObsolete: 'Le moteur de Visionterface est obsolète (plus de correctifs de sécurité) : installez une version récente.',
    updMinor: 'Une mise à jour de sécurité du moteur est disponible : installez une version récente de Visionterface.',
    wOs: 'Système',
    tagline: 'Client autonome open source non officiel pour Visio',
    filter: 'Filtrer les liens…', favs: 'Favoris', recents: 'Récents',
    settingsBtn: '⚙ Réglages', creditsBtn: 'ⓘ Crédits',
    toggleSide: 'Afficher/masquer la liste', home: 'Accueil Visio', reload: 'Recharger',
    urlPh: 'Collez un lien de réunion ou un code (ex. abc-defg-hij), puis Entrée',
    join: 'Rejoindre', name: '★ Nommer', nameTitle: 'Enregistrer ce lien avec un nom',
    onTop: 'Toujours au premier plan',
    clipDetected: 'Lien Visio détecté dans le presse-papiers :', ignore: 'Ignorer',
    fName: 'Nom', fNamePh: 'ex. Réunion d\'équipe', fUrl: 'Lien',
    cancel: 'Annuler', save: 'Enregistrer', close: 'Fermer',
    nameLink: 'Nommer le lien', editLink: 'Modifier le lien',
    shareTitle: 'Partager l\'écran', shareAudio: 'Partager aussi le son de l\'ordinateur',
    settings: 'Réglages',
    sKeep: 'Rester connecté entre deux lancements (conserve les cookies de session)',
    sClip: 'Détecter un lien Visio dans le presse-papiers',
    localOnly: 'Les liens sont stockés localement sur ce PC, nulle part ailleurs.',
    logout: 'Se déconnecter / effacer la session',
    logoutConfirm: 'Effacer la session (vous devrez vous reconnecter) ? Vos liens sont conservés.',
    noFavs: 'Aucun favori. Cliquez ★ Nommer pendant une réunion.',
    noRecents: 'Les réunions rejointes apparaîtront ici.',
    edit: 'Nommer / modifier', copy: 'Copier le lien', del: 'Supprimer',
    delConfirm: (n) => `Supprimer « ${n} » ?`,
    badLink: 'Lien ou code non reconnu',
    notVisio: (u) => `Ce lien n'est pas un lien Visio :\n${u}\n\nL'ouvrir quand même ?`,
    stOk: 'Connecté', stRoom: 'En réunion (mise en veille bloquée)', stOff: 'Hors ligne — reconnexion automatique',
    credits: 'Crédits', mitTitle: 'Licence MIT',
    creditsBody: `
      <p><b>Visionterface</b> v<span class="appver">1.0</span> — client autonome open source <i>non officiel</i> pour Visio,
        <a href="#" data-ext="https://visio.numerique.gouv.fr/">visio.numerique.gouv.fr</a>.</p>
      <p>Conception et développement : <b>D. C. Vaidis</b>. Logiciel libre sous licence MIT.</p>
      <p>Codé avec Claude (Anthropic, Opus 5.5).</p>
      <p>Visio est un service de la DINUM (La Suite numérique). Cette application se contente d'afficher
        le site officiel dans une fenêtre dédiée ; elle n'en reprend pas le code et n'est ni affiliée
        ni approuvée par la DINUM. « Visio » est aussi une marque de Microsoft Corporation, sans lien avec ce logiciel.</p>
      <p>Composants : Electron (licence MIT) et Chromium (licences BSD et autres, voir
        <code>LICENSES.chromium.html</code> livré avec l'application). Illustration Kofikat : CC BY-NC 4.0 — 2026 Vaidis.</p>`
  },
  en: {
    helpBtn: '? Help', helpTab: 'Help', logTab: "What's new", nextTab: 'Next version', whatsNew: "What's new",
    updRestart: 'Update and restart', updDownload: 'Download the update',
    updProgress: (p) => `Downloading the update… ${p}%`, updApplying: 'Installing… Visionterface will restart.',
    updFailed: (e) => `Update failed: ${e}`, updMacHint: 'Open the downloaded .dmg and drag Visionterface into Applications (replace).',
    curVersion: 'installed version', noNotes: 'No notes for this version.',
    helpBody: `
      <h4>Join a meeting</h4>
      <ul><li>Paste a meeting link, the whole invitation text or a code (e.g. <code>abc-defg-hij</code>) in the top bar, then press Enter.</li>
      <li>The current meeting is shown in large type; on the left, <b>Join</b> takes you back if the window did not open properly.</li></ul>
      <h4>Saved links</h4>
      <ul><li>Meetings you join go to <b>Recent</b> (15 at most).</li>
      <li><b>★ Name</b> saves the meeting to <b>Favourites</b> with a name; ✎ edit, ⧉ copy, ✕ delete.</li></ul>
      <h4>Sign-in</h4>
      <ul><li>Your ProConnect sign-in is kept between launches (Settings to turn off or sign out).</li>
      <li>Dot at the top right: green connected, blue in a meeting, orange offline (reconnects automatically).</li></ul>
      <h4>Updates</h4>
      <ul><li>Visionterface checks daily for a new version. A banner then offers <b>Update and restart</b> (Windows) or <b>Download</b> (Mac).</li>
      <li><b>⟳ Versions</b> lists the components (Electron, Chromium, Node.js) and their status.</li></ul>
      <h4>Privacy</h4>
      <ul><li>Links and settings stay on this computer. Only version checks contact GitHub and releases.electronjs.org.</li></ul>`,
    versionsBtn: '⟳ Versions', nowLabel: 'In meeting:', details: 'Details',
    rcActive: 'Current meeting', rcIdle: 'Last meeting', rcClear: 'Forget',
    sAuto: 'Check versions automatically (at start-up, then daily)',
    versionsTitle: 'Component versions', vComp: 'Component', vInst: 'Installed', vLatest: 'Latest', vState: 'Status',
    vNote: 'Chromium, Node.js and V8 are bundled with Electron: they are updated with a new Visionterface release.',
    vCheckNow: 'Check now', vDownload: 'Download the new version', vChecking: 'Checking…',
    vChecked: (d) => `Last checked: ${d}`, vNever: 'Not checked yet.',
    sOk: 'Up to date', sSupported: 'Supported', sMinor: 'Update advised', sObsolete: 'Obsolete', sUnknown: 'Unknown (offline?)',
    sUpdate: 'New version', sNoRepo: 'Repository not set', sInfo: '—', sBundled: 'Bundled (follows Electron)',
    updApp: (v) => `A new version of Visionterface is available (${v}).`,
    updObsolete: 'Visionterface\'s engine is obsolete (no more security fixes): please install a recent version.',
    updMinor: 'An engine security update is available: please install a recent version of Visionterface.',
    wOs: 'System',
    tagline: 'Unofficial open source standalone client for Visio',
    filter: 'Filter links…', favs: 'Favourites', recents: 'Recent',
    settingsBtn: '⚙ Settings', creditsBtn: 'ⓘ Credits',
    toggleSide: 'Show/hide the list', home: 'Visio home', reload: 'Reload',
    urlPh: 'Paste a meeting link or code (e.g. abc-defg-hij), then press Enter',
    join: 'Join', name: '★ Name', nameTitle: 'Save this link with a name',
    onTop: 'Always on top',
    clipDetected: 'Visio link found on the clipboard:', ignore: 'Dismiss',
    fName: 'Name', fNamePh: 'e.g. Team meeting', fUrl: 'Link',
    cancel: 'Cancel', save: 'Save', close: 'Close',
    nameLink: 'Name this link', editLink: 'Edit link',
    shareTitle: 'Share your screen', shareAudio: 'Also share computer audio',
    settings: 'Settings',
    sKeep: 'Stay signed in between launches (keeps session cookies)',
    sClip: 'Detect Visio links on the clipboard',
    localOnly: 'Links are stored locally on this PC only.',
    logout: 'Sign out / clear session',
    logoutConfirm: 'Clear the session (you will need to sign in again)? Your links are kept.',
    noFavs: 'No favourites yet. Click ★ Name during a meeting.',
    noRecents: 'Meetings you join will appear here.',
    edit: 'Name / edit', copy: 'Copy link', del: 'Delete',
    delConfirm: (n) => `Delete “${n}”?`,
    badLink: 'Link or code not recognised',
    notVisio: (u) => `This is not a Visio link:\n${u}\n\nOpen it anyway?`,
    stOk: 'Connected', stRoom: 'In a meeting (sleep blocked)', stOff: 'Offline — reconnecting automatically',
    credits: 'Credits', mitTitle: 'MIT Licence',
    creditsBody: `
      <p><b>Visionterface</b> v<span class="appver">1.0</span> — <i>unofficial</i> open source standalone client for Visio,
        <a href="#" data-ext="https://visio.numerique.gouv.fr/">visio.numerique.gouv.fr</a>.</p>
      <p>Design and development: <b>D. C. Vaidis</b>. Free software under the MIT Licence.</p>
      <p>Coded with Claude (Anthropic, Opus 5.5).</p>
      <p>Visio is a service of DINUM (La Suite numérique, French government). This application only
        displays the official website in a dedicated window; it reuses none of its code and is neither
        affiliated with nor endorsed by DINUM. “Visio” is also a trademark of Microsoft Corporation, unrelated to this software.</p>
      <p>Components: Electron (MIT Licence) and Chromium (BSD and other licences, see
        <code>LICENSES.chromium.html</code> shipped with the application). Kofikat illustration: CC BY-NC 4.0 — 2026 Vaidis.</p>`
  }
};
let LANG = 'fr';
function t(key, ...args) {
  const v = (I18N[LANG] && I18N[LANG][key]) ?? I18N.fr[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}
function applyI18n() {
  document.documentElement.lang = LANG === 'en' ? 'en-GB' : 'fr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('.kofi-support').forEach(e => { e.dataset.lang = LANG; });
  const b = document.getElementById('btnLang');
  if (b) b.textContent = LANG === 'fr' ? 'EN' : 'FR';
}
