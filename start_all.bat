@echo off
title Smart Inventory System Launcher
echo ===================================================
echo  Starting Smart Inventory and Supply Chain System
echo ===================================================
echo Starting Backend Server on http://localhost:8080 ...
start "Backend Server (Spring Boot)" cmd /k "cd /d %~dp0backend && ..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=h2"

echo Waiting 6 seconds for backend initialization...
timeout /t 6 /nobreak >nul

echo Starting Frontend Dev Server on http://localhost:5173 ...
start "Frontend Server (React Vite)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo Opening browser at http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Both servers are now running in separate terminal windows!
echo Keep those windows open while using the application.
echo.
pause
