@echo off
setlocal
cd /d "%~dp0.."
echo === Visionterface - construction de l exe portable ===
if not exist "package.json" (
  echo ERREUR : extrayez d'abord le zip ^(clic droit ^> Extraire tout^).
  goto :fin
)
call "%~dp0find-node.cmd"
if errorlevel 1 (
  echo Installez Node.js ^(LTS^) ou indiquez le dossier de la version autonome.
  goto :fin
)
call npm install
if errorlevel 1 ( echo ERREUR npm install & goto :fin )
call "%~dp0install-electron.cmd"
if errorlevel 1 goto :fin
call npm run dist
if errorlevel 1 ( echo ERREUR construction & goto :fin )
echo.
echo OK : l'executable est dans le dossier "dist".
explorer dist
:fin
echo.
pause
