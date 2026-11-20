' Lance Visionterface (mode developpement) sans fenetre de console
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
d = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
exe = d & "\node_modules\electron\dist\electron.exe"
If Not fso.FileExists(exe) Then
  MsgBox "Electron est absent. Lancez d'abord test.bat.", 48, "Visionterface"
  WScript.Quit
End If
sh.CurrentDirectory = d
sh.Run """" & exe & """ """ & d & """", 1, False
