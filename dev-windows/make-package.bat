@echo off
setlocal
cd /d "%~dp0.."
title Visionterface - creation du paquet Windows pour le labo
echo === Creation du paquet Windows a distribuer ===
call "%~dp0find-node.cmd" || goto :fin
if not exist "node_modules\electron\package.json" ( call npm install --no-audit --no-fund || goto :fin )
call "%~dp0install-electron.cmd" || goto :fin
call node scripts\package-win.js || goto :fin
for /f "usebackq delims=" %%v in (`node -p "require('./package.json').version"`) do set "V=%%v"
echo Compression...
powershell -NoProfile -Command "Compress-Archive -Path 'out\Visionterface' -DestinationPath 'out\Visionterface-%V%-Windows.zip' -Force"
if errorlevel 1 ( echo ERREUR compression & goto :fin )
echo.
echo OK : out\Visionterface-%V%-Windows.zip
echo A envoyer aux collegues : ils extraient le zip puis lancent Install.bat.
explorer out
:fin
echo.
pause
