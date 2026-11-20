@echo off
title Visionterface - Uninstall
set "DEST=%LOCALAPPDATA%\Programs\Visionterface"
taskkill /im Visionterface.exe /f >nul 2>&1
powershell -NoProfile -Command "Remove-Item -ErrorAction SilentlyContinue (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Visionterface.lnk'), (Join-Path ([Environment]::GetFolderPath('Programs')) 'Visionterface.lnk')"
choice /m "Also delete your saved links and session / Effacer aussi vos liens et votre session"
if errorlevel 2 goto next
rmdir /s /q "%APPDATA%\Visionterface"
echo Data deleted / Donnees effacees.
:next
echo Visionterface uninstalled / desinstalle.
pause
cd /d "%TEMP%" & rmdir /s /q "%DEST%" & exit /b 0
