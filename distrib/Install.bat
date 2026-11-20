@echo off
setlocal
title Visionterface - Install
REM Installs Visionterface for the current user (no administrator rights needed).
set "DEST=%LOCALAPPDATA%\Programs\Visionterface"
echo.
echo  Installing Visionterface into / Installation dans :
echo  %DEST%
echo.
if not exist "%~dp0Visionterface.exe" (
  echo ERROR: extract the zip first ^(right-click ^> Extract All^), then run Install.bat again.
  echo ERREUR : extrayez d'abord le zip ^(clic droit ^> Extraire tout^), puis relancez Install.bat.
  pause & exit /b 1
)
taskkill /im Visionterface.exe /f >nul 2>&1
robocopy "%~dp0." "%DEST%" /e /njh /njs /ndl /nfl /np >nul
if errorlevel 8 ( echo ERROR: copy failed / ERREUR pendant la copie. & pause & exit /b 1 )
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d='%DEST%'; $ws=New-Object -ComObject WScript.Shell;" ^
  "foreach($p in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))){" ^
  " $s=$ws.CreateShortcut((Join-Path $p 'Visionterface.lnk'));" ^
  " $s.TargetPath=(Join-Path $d 'Visionterface.exe'); $s.WorkingDirectory=$d;" ^
  " $s.IconLocation=(Join-Path $d 'icon.ico')+',0';" ^
  " $s.Description='Visionterface - unofficial open source standalone client for Visio'; $s.Save() }"
echo  OK: "Visionterface" shortcut on the Desktop and in the Start menu.
echo  OK : raccourci "Visionterface" sur le Bureau et dans le menu Demarrer.
echo  Tip / Astuce: right-click the shortcut ^> Pin to taskbar / Epingler a la barre des taches.
echo.
start "" "%DEST%\Visionterface.exe"
pause
