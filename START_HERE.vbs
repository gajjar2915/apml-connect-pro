Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath
WshShell.Run "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File 0_Server_Host_Setup\launch_silent.ps1", 0, False
