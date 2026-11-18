@echo off
title Smart Inventory System - Backend (Port 8080)
setlocal enabledelayedexpansion

echo ===================================================
echo  Starting Smart Inventory Spring Boot Backend...
echo ===================================================

cd /d "%~dp0backend"

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

echo Java Home: %JAVA_HOME%
echo Using Maven: %MVN_CMD%
echo Profile: In-Memory H2 (Runs immediately, zero configuration needed)
echo Backend will be available at: http://localhost:8080
echo ===================================================
echo.

call "%MVN_CMD%" spring-boot:run "-Dspring-boot.run.profiles=h2"

pause
