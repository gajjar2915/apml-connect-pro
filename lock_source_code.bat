@echo off
chcp 65001 >nul
title APML Connect Pro - Lock Source Code
echo ===================================================
echo   APML Connect Pro - Lock Source Code Utility
echo ===================================================
echo.
echo Locking and hiding all internal source directories...
echo.

attrib +h +s "%~dp00_Server_Host_Setup" /d >nul 2>nul
attrib +h +s "%~dp01_Receptionist_Setup" /d >nul 2>nul
attrib +h +s "%~dp02_Doctor_Setup" /d >nul 2>nul
attrib +h +s "%~dp03_Pharmacy_Setup" /d >nul 2>nul
attrib +h +s "%~dp04_Mobile_App_Setup" /d >nul 2>nul
attrib +h +s "%~dp0Documentation_&_Reports" /d >nul 2>nul
attrib +h +s "%~dp0.github" /d >nul 2>nul

attrib +h +s /s /d "%~dp00_Server_Host_Setup\*.*" >nul 2>nul
attrib +h +s /s /d "%~dp01_Receptionist_Setup\*.*" >nul 2>nul
attrib +h +s /s /d "%~dp02_Doctor_Setup\*.*" >nul 2>nul
attrib +h +s /s /d "%~dp03_Pharmacy_Setup\*.*" >nul 2>nul
attrib +h +s /s /d "%~dp04_Mobile_App_Setup\*.*" >nul 2>nul
attrib +h +s /s /d "%~dp0Documentation_&_Reports\*.*" >nul 2>nul

attrib -h -s "%~dp0START_HERE.bat" >nul 2>nul
attrib -h -s "%~dp0START_HERE.vbs" >nul 2>nul
attrib -h -s "%~dp0APML_Connect_Pro_Unified_Login.html" >nul 2>nul
attrib -h -s "%~dp0APML_Connect_Pro_Liquid_Launcher.html" >nul 2>nul
attrib -h -s "%~dp0README.md" >nul 2>nul
attrib -h -s "%~dp0unlock_source_code.bat" >nul 2>nul

echo [OK] Source code hidden! Only launcher files (START_HERE) are visible.
echo.
pause
