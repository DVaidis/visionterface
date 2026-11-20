# Visionterface — outils de développement Windows (dossier dev-windows)

Client autonome open source non officiel pour Visio (https://visio.numerique.gouv.fr) — *Unofficial open source standalone client for Visio*. Fenêtre dédiée, hors navigateur.
D. C. Vaidis — licence MIT — codé avec Claude (Anthropic, Opus 5.5). Non affilié à la DINUM.

## Distribuer au labo
**Recommandé : GitHub** (voir `GITHUB-PROCEDURE.md`) — zip Windows et .dmg Mac construits automatiquement à chaque Release ; lien unique `…/releases/latest` à envoyer.

Sans GitHub (Windows uniquement) :
1. Sur votre poste : `dev-windows\test.bat` une fois (installe Electron), puis `dev-windows\make-package.bat`.
2. Envoyer `out\Visionterface-<version>-Windows.zip` aux collègues (≈ 110 Mo ; lien de partage plutôt que mail).
3. Eux : clic droit > Extraire tout, puis `Install.bat` → installation sans droits administrateur dans
   `%LOCALAPPDATA%\Programs\Visionterface`, raccourcis Bureau + menu Démarrer. `Uninstall.bat` pour retirer.
   Aucun besoin de Node.js chez eux.

Alternative : `dev-windows\build-portable.bat` → un seul `dist\Visionterface-1.0.0-portable.exe` (electron-builder ; télécharge des outils depuis GitHub).

## Votre poste (développement)
- `dev-windows\test.bat` : installe et lance. `dev-windows\create-shortcut.bat` : raccourci vers la version de développement. `dev-windows\Visionterface.vbs` : lancement sans console.
- Node.js autonome (zip) accepté : cherché automatiquement ou demandé une fois (mémorisé dans `node_path.txt`).

## Fonctions
- Réunion en cours affichée en grand (bandeau bleu) et rappelée à gauche avec un bouton **Rejoindre** (aussi pour la dernière réunion si la fenêtre s'est mal ouverte).
- **Versions** : tableau Visionterface / Electron / Chromium / Node.js / V8 avec état (À jour, Maintenu, Mise à jour conseillée, Obsolète) ; vérification automatique au démarrage puis chaque jour (désactivable). Contacte `releases.electronjs.org` et, si `visionterface.githubRepo` est renseigné dans `package.json` (ex. `utilisateur/visionterface`), `api.github.com`.
- Barre de lien : lien d'invitation, texte entier de l'invitation ou code `abc-defg-hij`.
- Récents (15 max) automatiques ; ★ Nommer → Favoris ; renommer ✎, copier ⧉, supprimer ✕, filtrer.
- Session ProConnect conservée (cookies de session prolongés 30 j, désactivable) ; bouton de déconnexion.
- Maintien de la connexion : pas de ralentissement en arrière-plan, veille écran bloquée en réunion, rechargement automatique après coupure ou plantage, confirmation avant de quitter une réunion.
- Partage d'écran (écran/fenêtre, son système en option) ; 📌 premier plan ; FR / EN (UK) ; Crédits (MIT, Kofikat).

Données : `%APPDATA%\Visionterface\` (liens : `visio-data.json`), reprises automatiquement depuis l'ancien nom « Visio Desktop ».

## Limites
- Exécutable non signé : avertissement SmartScreen au premier lancement (« Informations complémentaires » > « Exécuter quand même »).
- Vérifier avec la DSI que l'usage d'un client non officiel est accepté avant diffusion large.
