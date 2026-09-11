@echo off
title APML Connect Pro Central Server Host
echo ===================================================
echo   APML Connect Pro - Central Server Host Launcher
echo ===================================================
echo.

:: Detect local IPv4 address dynamically
set "LOCAL_IP=192.168.1.7"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1 delims= " %%b in ("%%a") do (
        if not "%%b"=="127.0.0.1" set "LOCAL_IP=%%b"
    )
)

echo Central Server Local Wi-Fi IP Detected: %LOCAL_IP%
echo.
echo Checking for Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed on this system!
    echo Please install Docker Desktop to run the central server stack.
    pause
    exit /b
)

echo Checking if Docker daemon is running and responsive...
docker info >nul 2>nul
if %errorlevel% equ 0 goto :docker_ok

echo Docker daemon is not responding or is paused. Attempting automatic startup/unpause...

:: Attempt waking up Docker via CLI plugin first
docker desktop start >nul 2>nul
timeout /t 3 >nul

docker info >nul 2>nul
if %errorlevel% equ 0 goto :docker_ok

echo Resetting WSL subsystem pipe and starting Docker Desktop...
wsl --shutdown >nul 2>nul

:: Locate Docker Desktop executable across possible installation paths
set "DOCKER_PATH="
if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" set "DOCKER_PATH=%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
if not defined DOCKER_PATH if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" set "DOCKER_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe"
if not defined DOCKER_PATH if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" set "DOCKER_PATH=%ProgramFiles%\Docker\Docker Desktop.exe"

if defined DOCKER_PATH (
    echo Launching Docker Desktop from: "%DOCKER_PATH%"
    start "" "%DOCKER_PATH%"
) else (
    echo Launching Docker Desktop...
    start "" "Docker Desktop"
)

echo Waiting for Docker daemon to initialize...
set /a wait_count=0

:wait_docker
timeout /t 4 >nul
set /a wait_count+=4
docker info >nul 2>nul
if %errorlevel% equ 0 goto :docker_ok

if %wait_count% geq 40 (
    docker desktop start >nul 2>nul
)

if %wait_count% geq 80 (
    echo.
    echo [ERROR] Could not connect to Docker daemon after 80 seconds.
    echo Please ensure Docker Desktop is open and unpaused, then re-run this script.
    pause
    exit /b
)

echo Still waiting for Docker daemon... (%wait_count%s)
goto :wait_docker

:docker_ok
echo Docker started successfully!

echo.
echo Starting APML Connect Pro application stack...
echo.
cd /d "%~dp0"
docker compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start docker-compose.
    pause
    exit /b
)

echo.
echo ===================================================
echo  APML Connect Pro Server is now running!
echo  
echo  Workstation Port Links:
echo    - Reception Desk (3001): http://localhost:3001
echo    - Doctor Cabinet (3002): http://localhost:3002
echo    - Pharmacy Counter (3003): http://localhost:3003
echo
echo  Remote Devices on Wi-Fi:
echo    - Reception: http://%LOCAL_IP%:3001
echo    - Doctor:    http://%LOCAL_IP%:3002
echo    - Pharmacy:  http://%LOCAL_IP%:3003
echo ===================================================
echo.
echo Opening browser to Receptionist Dashboard...
timeout /t 3 >nul
start http://localhost:3001

echo.
echo Press any key to stop the application and clean up containers...
pause >nul
echo Stopping APML Connect Pro stack...
docker-compose down -v
echo Done!
pause
