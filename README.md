# Visionterface

**Client autonome open source non officiel pour Visio** (https://visio.numerique.gouv.fr)
*Unofficial open source standalone client for Visio*

Fenêtre dédiée hors navigateur, liens de réunion mémorisés et nommables, session ProConnect conservée, maintien de la connexion. Interface FR / EN.

> Non affilié à la DINUM ni approuvé par elle. Visionterface affiche le site officiel dans une fenêtre dédiée et n'en reprend pas le code. « Visio » est aussi une marque de Microsoft Corporation, sans lien avec ce logiciel.

## Télécharger
Dernière version : **[Releases](../../releases/latest)** — `…-Windows.zip` (Windows 10/11, 64 bits) ou `…-Mac.dmg` (macOS, Intel et Apple Silicon).

**Windows** : clic droit > Extraire tout > `Install.bat` (sans droits administrateur, rien d'autre à installer). Avertissement SmartScreen au premier lancement : « Informations complémentaires » > « Exécuter quand même ».

**macOS** : ouvrir le `.dmg`, glisser Visionterface dans Applications. Non signée par Apple : premier lancement par clic droit > Ouvrir (macOS 15+ : Réglages Système > Confidentialité et sécurité > Ouvrir quand même ; si « endommagée » : `xattr -cr /Applications/Visionterface.app`). Autoriser caméra, micro et, pour partager l'écran, « Enregistrement de l'écran ».

## Fonctions
- Coller un lien d'invitation, le texte entier de l'invitation ou un code (`abc-defg-hij`).
- Récents automatiques, ★ Nommer → Favoris ; renommer, copier, supprimer, filtrer.
- Session conservée entre deux lancements ; bouton de déconnexion.
- Pas de ralentissement en arrière-plan, veille écran bloquée en réunion, reconnexion automatique, confirmation avant de quitter une réunion.
- Partage d'écran (écran/fenêtre, son système en option), fenêtre toujours au premier plan.
- Versions des composants (Electron, Chromium, Node.js…) avec état À jour / Obsolète, vérification automatique quotidienne.
- Mise à jour intégrée : « Mettre à jour et redémarrer » (Windows), téléchargement direct (Mac). Onglet **? Aide** avec le journal des modifications.
- Moteur Electron tenu à jour automatiquement : chaque lundi, si un correctif est sorti, une nouvelle version est testée, publiée et construite sans intervention.
- Données stockées localement uniquement (`%APPDATA%\Visionterface` ; macOS : `~/Library/Application Support/Visionterface`).

## Développement
Publication : voir [GITHUB-PROCEDURE.md](GITHUB-PROCEDURE.md) (construction automatique Windows + Mac à chaque Release).
Tests locaux sous Windows : dossier [dev-windows](dev-windows/README-DEV.md) : `test.bat` (installe et lance), `make-package.bat` (crée le zip à distribuer), `build-portable.bat` (exe portable, facultatif). Nécessite Node.js (version autonome acceptée).

## Licences
- Code : licence MIT — © 2026 D. C. Vaidis (voir [LICENSE](LICENSE)).
- Illustration **Kofikat** (bloc de soutien dans `src/index.html`) : **CC BY-NC 4.0** — 2026 Vaidis. Non couverte par la licence MIT.
- Electron : MIT. Chromium : BSD et autres (`LICENSES.chromium.html`, livré avec l'application).

Codé avec Claude (Anthropic, Opus 5.5). Citation : voir [CITATION.cff](CITATION.cff).
☕ Soutenir : https://ko-fi.com/dcv10
