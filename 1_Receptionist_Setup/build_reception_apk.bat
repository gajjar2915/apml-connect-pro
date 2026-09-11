@echo off
title APML Receptionist Mobile APK Builder
echo ===================================================
echo   APML Receptionist Mobile APK Generator
echo ===================================================
echo.
echo Option 1: Open project in Android Studio to build APK
echo Option 2: Build 1-Click APK online via PWABuilder
echo.

set "ANDROID_STUDIO=C:\Program Files\Android\Android Studio\bin\studio64.exe"

if exist "%ANDROID_STUDIO%" (
    echo Launching Android Studio project...
    start "" "%ANDROID_STUDIO%" "%~dp0receptionist_android_apk"
    echo.
    echo In Android Studio, click: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
) else (
    echo Android Studio not detected at default path.
    echo Opening online 1-click APK generator...
    start https://www.pwabuilder.com
)

pause
