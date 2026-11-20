@echo off
REM Raccourci pour VOTRE poste de developpement (les collegues utilisent Install.bat du paquet).
cd /d "%~dp0.."
if not exist "node_modules\electron\dist\electron.exe" (
  echo Electron absent : lancez d'abord test.bat.
  pause & exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=(Get-Location).Path; $ws=New-Object -ComObject WScript.Shell;" ^
  "foreach($p in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))){" ^
  " $s=$ws.CreateShortcut((Join-Path $p 'Visionterface.lnk'));" ^
  " $s.TargetPath=(Join-Path $d 'node_modules\electron\dist\electron.exe');" ^
  " $s.Arguments='\"'+$d+'\"'; $s.WorkingDirectory=$d;" ^
  " $s.IconLocation=(Join-Path $d 'build\icon.ico')+',0';" ^
  " $s.Description='Visionterface - client non officiel pour Visio'; $s.Save() }"
if errorlevel 1 ( echo ERREUR lors de la creation du raccourci. ) else (
  echo OK : raccourci "Visionterface" cree sur le Bureau et dans le menu Demarrer.
)
pause
