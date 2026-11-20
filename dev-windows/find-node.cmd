@echo off
REM Rend node/npm disponibles, y compris avec une version AUTONOME (zip) de Node.js.
REM Ordre : PATH > node_path.txt > dossiers node-v*-win-x64 habituels > saisie manuelle.
where node >nul 2>&1 && exit /b 0

if exist "%~dp0node_path.txt" (
  set /p NODE_DIR=<"%~dp0node_path.txt"
)
if defined NODE_DIR call :try "%NODE_DIR%" && exit /b 0

REM Dossier node-v* place dans le projet (detection par dir, la plus fiable)
for /f "delims=" %%N in ('dir /b /ad "%~dp0node-v*" 2^>nul') do (
  call :try "%~dp0%%N" && exit /b 0
)
for /f "delims=" %%N in ('dir /b /ad "%~dp0..\node-v*" 2^>nul') do (
  call :try "%~dp0..\%%N" && exit /b 0
)
for /d %%D in ("%~dp0node-v*-win-x64" "%~dp0..\node-v*-win-x64" "%~dp0..\..\node-v*-win-x64" "%USERPROFILE%\node-v*-win-x64" "%USERPROFILE%\Downloads\node-v*-win-x64" "%USERPROFILE%\Desktop\node-v*-win-x64" "%USERPROFILE%\Documents\node-v*-win-x64" "C:\node-v*-win-x64" "C:\Program Files\node-v*-win-x64") do (
  call :try "%%~fD" && exit /b 0
)

echo.
echo Node.js autonome non trouve automatiquement.
echo Collez le chemin du dossier qui contient node.exe
echo ^(ex. C:\Users\vous\Downloads\node-v26.13.1-win-x64^) puis Entree :
set "NODE_DIR="
set /p NODE_DIR=Chemin : 
if not defined NODE_DIR exit /b 1
call :try "%NODE_DIR:"=%" && exit /b 0
echo ERREUR : node.exe introuvable dans ce dossier.
exit /b 1

:try
set "D=%~f1"
REM Le zip contient parfois un sous-dossier du meme nom
if not exist "%D%\node.exe" if exist "%D%\%~nx1\node.exe" set "D=%D%\%~nx1"
if not exist "%D%\node.exe" exit /b 1
set "PATH=%D%;%PATH%"
>"%~dp0node_path.txt" echo %D%
echo Node.js trouve : %D%
exit /b 0
