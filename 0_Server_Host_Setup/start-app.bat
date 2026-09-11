@echo off
title APML Connect Pro Offline Demo Launcher
echo ===================================================
echo   APML Connect Pro - Offline Demo Launcher
echo ===================================================
echo.
echo Checking for Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed on this system!
    echo Please install Docker Desktop to run the full application.
    echo.
    echo Alternative: You can open 'login.html' directly in your browser.
    pause
    exit /b
)

echo Checking if Docker daemon is running and responsive...
docker info >nul 2>nul
if %errorlevel% equ 0 goto :docker_ok

echo Docker daemon is not responding or is paused. Attempting automatic startup/unpause...

docker desktop start >nul 2>nul
timeout /t 3 >nul

docker info >nul 2>nul
if %errorlevel% equ 0 goto :docker_ok

echo Resetting WSL subsystem pipe and starting Docker Desktop...
wsl --shutdown >nul 2>nul

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
echo (This may take a moment on the first run to build containers)
echo.
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start docker-compose.
    echo Please check if Docker Desktop is running and try again.
    pause
    exit /b
)

echo.
echo ===================================================
echo APML Connect Pro is now running!
echo Receptionist Desk: http://localhost:3001
echo Doctor Cabinet:     http://localhost:3002
echo Pharmacy Counter:   http://localhost:3003
echo Backend API:        http://localhost:5005
echo ===================================================
echo.
echo Opening your browser to Receptionist Dashboard...
timeout /t 3 >nul
start http://localhost:3001

echo.
echo Press any key to stop the application and clean up containers...
pause >nul
echo Stopping APML Connect Pro stack...
docker-compose down
echo Done!
pause
