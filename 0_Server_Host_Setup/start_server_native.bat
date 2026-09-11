@echo off
title APML Connect Pro Central Server Host (Native Offline Mode)
echo ===================================================
echo   APML Connect Pro - Central Server Host Launcher
echo ===================================================
echo.
echo Starting APML Connect Pro native services (Backend + 3 Workstations)...
echo Services will be available on loopback 127.0.0.1 (Offline-Ready)
echo.

cd /d "%~dp0"
node start_all.js

echo Services started cleanly in background.
echo Opening browser portal...
timeout /t 2 >nul
start "" "%~dp0..\APML_Connect_Pro_Unified_Login.html"
