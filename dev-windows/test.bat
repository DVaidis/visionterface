@echo off
setlocal
cd /d "%~dp0.."
echo === Visionterface - test ===
echo Dossier : %CD%
echo.
if not exist "package.json" (
  echo ERREUR : package.json introuvable.
  echo Avez-vous bien EXTRAIT le zip ^(clic droit ^> Extraire tout^) ?
  echo Lancer le .bat depuis l'apercu du zip ne fonctionne pas.
  goto :fin
)
call "%~dp0find-node.cmd"
if errorlevel 1 (
  echo Installez Node.js ^(LTS^) ou indiquez le dossier de la version autonome.
  goto :fin
)
echo Node.js :
node -v
echo.
if not exist "node_modules\electron\dist\electron.exe" (
  echo Installation des dependances ^(premiere fois : 2 a 10 min, ~150 Mo^).
  echo Les lignes "npm warn deprecated" sont normales. Le telechargement d Electron est SILENCIEUX : ne fermez pas.
  call npm install
  if errorlevel 1 (
    echo ERREUR pendant npm install. Voir les messages ci-dessus.
    goto :fin
  )
)
call "%~dp0install-electron.cmd"
if errorlevel 1 goto :fin
echo Lancement de l'application...
call npm start
if errorlevel 1 echo L'application s'est arretee avec une erreur ^(voir ci-dessus^).
:fin
echo.
pause
