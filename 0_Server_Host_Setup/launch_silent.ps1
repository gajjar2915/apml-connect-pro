$rootDir = Split-Path -Path $PSScriptRoot -Parent
Set-Location -Path $rootDir

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'node.exe'
$psi.Arguments = '0_Server_Host_Setup\start_all.js'
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$psi.CreateNoWindow = $true
$psi.UseShellExecute = $false
[System.Diagnostics.Process]::Start($psi) | Out-Null

# Native Win32 Window Hider Daemon to instantly hide any next-server (v14.2.15) windows
$windowHiderScript = @"
using System;
using System.Runtime.InteropServices;
public class WindowHider {
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
Add-Type -TypeDefinition $windowHiderScript -ErrorAction SilentlyContinue

for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 400
    Get-Process | Where-Object { 
        $_.MainWindowTitle -like "*next-server*" -or 
        $_.MainWindowTitle -like "*Node*" -or 
        $_.MainWindowTitle -like "*cmd*" -or 
        $_.MainWindowTitle -like "*npm*" 
    } | ForEach-Object {
        if ($_.MainWindowHandle -ne [IntPtr]::Zero) {
            [WindowHider]::ShowWindow($_.MainWindowHandle, 0)
        }
    }
}
