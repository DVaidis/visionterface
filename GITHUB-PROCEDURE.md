# Visionterface sur GitHub — procédure « propre », du début à la fin

Durée : ~30 min, dont 15 min d'attente.
Résultat : la page https://github.com/DVaidis/visionterface avec, dans **Releases**, un zip Windows et un .dmg Mac construits automatiquement.

> Pourquoi GitHub Desktop et pas le site ? Le site ne reprend pas les dossiers dont le nom commence par un point
> (`.github`), or c'est là que se trouve la construction automatique. GitHub Desktop envoie tout.

---

## Étape 1 — Supprimer l'ancien dépôt (2 min)

1. Ouvrir https://github.com/DVaidis/visionterface/settings
2. Tout en bas, zone rouge **Danger Zone** > **Delete this repository**.
3. Confirmer (taper `DVaidis/visionterface` si demandé). Les anciennes Releases et tags partent avec.

## Étape 2 — Préparer le dossier (2 min)

1. Extraire `Visionterface-GitHub-clean.zip` sur le **Bureau** (clic droit > Extraire tout).
2. Vous obtenez un dossier `visionterface` qui contient notamment : `.github`, `src`, `scripts`, `README.md`, `package.json`.
3. Ne rien ajouter dedans (pas de `node_modules`, pas de Node).

## Étape 3 — Installer GitHub Desktop (5 min, une seule fois)

1. Télécharger https://desktop.github.com et installer (pas de droits administrateur nécessaires).
2. Au premier lancement : **Sign in to GitHub.com** > se connecter avec le compte DVaidis.
3. Écran de configuration Git : laisser le nom et l'e-mail proposés > **Finish**.

## Étape 4 — Envoyer le dossier sur GitHub (3 min)

1. Menu **File** > **Add local repository…**
2. **Choose…** > sélectionner le dossier `visionterface` du Bureau > **Add repository**.
3. Message « This directory does not appear to be a Git repository » : cliquer le lien bleu **create a repository**.
4. Fenêtre « Create a repository » :
   - Name : `visionterface`
   - Git ignore : **None** · License : **None**
   - **Create repository**
5. En bas à gauche, champ **Summary** : `Visionterface 1.0.1` > bouton **Commit to main**.
6. En haut : **Publish repository** >
   - Name : `visionterface`
   - **décocher** « Keep this code private »
   - **Publish repository**

Vérification : ouvrir https://github.com/DVaidis/visionterface — le dossier **`.github`** doit apparaître en premier dans la liste.

## Étape 5 — Publier la version 1.0.1 (3 min)

1. Sur la page du dépôt, colonne de droite : **Releases** > **Create a new release**.
2. **Choose a tag** > taper `v1.0.1` > cliquer **+ Create new tag: v1.0.1 on publish**.
3. **Release title** : `Visionterface 1.0.1`
4. Description (copier-coller) :
   ```
   Client autonome open source non officiel pour Visio.
   Windows : télécharger le .zip, Extraire tout, lancer Install.bat.
   Mac : télécharger le .dmg, glisser Visionterface dans Applications (voir README pour le premier lancement).
   ```
5. **Publish release**.

## Étape 6 — Attendre la construction (≈ 15 min)

1. Onglet **Actions** du dépôt : une ligne « Release » apparaît, avec un rond jaune (en cours).
2. Quand elle devient **verte** : retourner dans **Releases** > Visionterface 1.0.1 > **Assets** :
   - `Visionterface-1.0.1-Windows.zip`
   - `Visionterface-1.0.1-Mac.dmg`
3. Si elle devient **rouge** : cliquer la ligne > la tâche en rouge (`windows` ou `macos`) > l'étape en rouge >
   copier le texte et l'envoyer à Claude. Le .zip et le .dmg sont indépendants : l'un peut réussir sans l'autre.

## Étape 7 — Diffuser

Lien unique, toujours vers la dernière version :
**https://github.com/DVaidis/visionterface/releases/latest**

Collègues ayant la 1.0 reçue par Slack : leur dire de télécharger la 1.0.1 et de relancer `Install.bat`
(liens et session conservés). Ensuite, les nouvelles versions leur seront signalées automatiquement.

---

## Plus tard : publier une mise à jour

1. Remplacer les fichiers modifiés dans le dossier `visionterface` du Bureau.
2. GitHub Desktop : Summary > **Commit to main** > **Push origin** (en haut).
3. Nouvelle Release avec un tag supérieur : `v1.0.2`, `v1.1.0`… (un tag ne sert qu'une fois).
   Le numéro de version de l'application est pris automatiquement dans le tag.

## Installation pour les utilisateurs (rappel)

**Windows 10/11** : télécharger le .zip > clic droit > Extraire tout > `Install.bat`.
SmartScreen au premier lancement : « Informations complémentaires » > « Exécuter quand même ».

**macOS** : ouvrir le .dmg > glisser Visionterface dans Applications. Non signée par Apple :
clic droit > **Ouvrir** ; macOS 15+ : Réglages Système > Confidentialité et sécurité > **Ouvrir quand même** ;
si « endommagée » : Terminal > `xattr -cr /Applications/Visionterface.app`.
Autoriser caméra et micro ; partage d'écran : Réglages Système > Confidentialité et sécurité > Enregistrement de l'écran.

---

## Mises à jour automatiques (depuis la version 1.0.2)

**Moteur Electron (sans intervention)** — chaque lundi, le traitement « Electron update » (onglet Actions) :
1. regarde si un correctif d'Electron est sorti dans la version majeure utilisée ;
2. si oui : lance l'application quelques secondes pour vérifier qu'elle démarre, passe le numéro à la version suivante (ex. 1.0.2 → 1.0.3), ajoute une ligne au journal des modifications, publie la Release et construit Windows + Mac ;
3. les applications installées affichent alors « Mettre à jour et redémarrer » (Windows) ou « Télécharger la mise à jour » (Mac).

**Nouvelle version majeure d'Electron (semi-automatique)** — elle n'est pas appliquée seule : un ticket apparaît dans l'onglet **Issues** du dépôt (GitHub vous prévient par e-mail).
Pour l'appliquer : onglet **Actions** > **Electron update** > **Run workflow** > cocher **allow_major** > **Run workflow**. Puis fermer le ticket.

**Si un traitement échoue** (croix rouge, e-mail de GitHub) : rien n'est publié, les utilisateurs gardent la version précédente. Envoyer le message d'erreur à Claude.

**Vos propres changements** (nouvelles fonctions) : toujours manuels — fichiers modifiés, puis Release avec un numéro choisi par vous (ex. v1.1.0). Ajouter une entrée dans `src/changelog.json` (Claude la rédige).
