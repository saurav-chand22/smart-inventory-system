@echo off
title Smart Inventory System Launcher
setlocal enabledelayedexpansion

echo ===================================================
echo  Starting Smart Inventory and Supply Chain System
echo ===================================================

:: Configure JDK 21
if exist "C:\Program Files\Java\jdk-21" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    set "PATH=C:\Program Files\Java\jdk-21\bin;!PATH!"
)

:: Detect Maven binary
set "MVN_CMD="
if exist "%~dp0maven\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0maven\bin\mvn.cmd"
) else if exist "%~dp0maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0maven\apache-maven-3.9.6\bin\mvn.cmd"
) else if exist "%~dp0..\maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0..\maven\apache-maven-3.9.6\bin\mvn.cmd"
) else if exist "C:\Users\chand\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=C:\Users\chand\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd"
) else (
    where mvn >nul 2>nul
    if %errorlevel% equ 0 set "MVN_CMD=mvn"
)

if "%MVN_CMD%"=="" (
    echo [ERROR] Maven not found!
    pause
    exit /b 1
)

echo [1/2] Starting Backend Server on http://localhost:8080 ...
start "Backend Server (Spring Boot Port 8080)" cmd /k "cd /d "%~dp0backend" && if exist "C:\Program Files\Java\jdk-21" (set "JAVA_HOME=C:\Program Files\Java\jdk-21" && set "PATH=C:\Program Files\Java\jdk-21\bin;!PATH!") && "%MVN_CMD%" spring-boot:run "-Dspring-boot.run.profiles=h2""

echo Waiting 10 seconds for backend initialization...
powershell -Command "Start-Sleep -Seconds 10" >nul

echo [2/2] Starting Frontend Dev Server on http://localhost:5173 ...
start "Frontend Server (React Vite Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo Opening browser at http://localhost:5173 ...
powershell -Command "Start-Sleep -Seconds 3" >nul
start http://localhost:5173

echo.
echo ===================================================
echo Both Backend (8080) and Frontend (5173) are running!
echo Keep those terminal windows open.
echo Credentials:
echo   - Admin:    admin / admin123
echo   - Employee: employee / employee123
echo ===================================================
echo.
pause
