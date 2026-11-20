@echo off
REM Installe le moteur Electron dans node_modules\electron\dist (2 methodes).
REM Necessite que node soit dans le PATH (find-node.cmd) et npm install deja fait.
cd /d "%~dp0.."
if exist "node_modules\electron\dist\electron.exe" exit /b 0
if not exist "node_modules\electron\package.json" (
  echo ERREUR : node_modules\electron absent ^(npm install a echoue ?^).
  exit /b 1
)

echo Electron - methode 1 : script officiel ^(silencieux^)...
call node "node_modules\electron\install.js" >nul 2>&1
if exist "node_modules\electron\dist\electron.exe" goto :ok

echo Electron - methode 2 : telechargement direct depuis GitHub ^(~110 Mo^)...
set "EV="
for /f "usebackq delims=" %%v in (`node -p "require('./node_modules/electron/package.json').version"`) do set "EV=%%v"
if not defined EV set "EV=45.2.3"
set "ZIP=%TEMP%\electron-v%EV%-win32-x64.zip"
REM Reutilise un zip deja telecharge (reparation manuelle precedente)
if not exist "%ZIP%" if "%EV%"=="33.4.11" if exist "%TEMP%\electron.zip" copy /y "%TEMP%\electron.zip" "%ZIP%" >nul
if not exist "%ZIP%" (
  curl.exe -L --fail -o "%ZIP%" "https://github.com/electron/electron/releases/download/v%EV%/electron-v%EV%-win32-x64.zip"
  if errorlevel 1 (
    del "%ZIP%" >nul 2>&1
    echo ERREUR : telechargement impossible ^(reseau ou proxy bloquant GitHub^).
    exit /b 1
  )
)
if exist "node_modules\electron\dist" rmdir /s /q "node_modules\electron\dist"
mkdir "node_modules\electron\dist"
tar -xf "%ZIP%" -C "node_modules\electron\dist"
if errorlevel 1 (
  del "%ZIP%" >nul 2>&1
  echo ERREUR : archive Electron illisible ^(supprimee, relancez^).
  exit /b 1
)
<nul set /p "=electron.exe" > "node_modules\electron\path.txt"
if not exist "node_modules\electron\dist\electron.exe" (
  echo ERREUR : electron.exe a disparu juste apres extraction ^(antivirus ?^).
  echo Voir Securite Windows ^> Historique de protection.
  exit /b 1
)
:ok
echo Electron installe.
exit /b 0
