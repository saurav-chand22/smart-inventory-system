@echo off
title Smart Inventory System - Backend (Port 8080)
cd /d "%~dp0backend"
echo ===================================================
echo  Starting Smart Inventory Spring Boot Backend...
echo ===================================================
..\..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=h2
pause
