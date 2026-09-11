@echo off
title APML Connect Pro - Reception Desk PC Launcher
echo ===================================================
echo   APML Connect Pro - Reception Desk PC Launcher
echo ===================================================
echo.

set "CONFIG_FILE=%~dp0server_config.txt"
set "SERVER_IP="

if exist "%CONFIG_FILE%" (
    set /p SERVER_IP=<"%CONFIG_FILE%"
)

if "%SERVER_IP%"=="" (
    echo [FIRST RUN SETUP]
    echo Please enter the Central Server Host IP Address.
    echo (You can find this on the Host PC's launcher screen)
    echo.
    set /p SERVER_IP="Enter Server IP (e.g., 192.168.1.5): "
)

:: Trim spaces
for /f "tokens=* delims= " %%a in ("%SERVER_IP%") do set SERVER_IP=%%a

:: Save config
echo %SERVER_IP%>"%CONFIG_FILE%"

echo.
echo Launching Receptionist Dashboard...
echo Server IP: %SERVER_IP%
echo.
echo (If the page doesn't load, make sure both devices are on the same Wi-Fi)
echo.

timeout /t 2 >nul
start http://%SERVER_IP%:3001/dashboard/reception
exit
