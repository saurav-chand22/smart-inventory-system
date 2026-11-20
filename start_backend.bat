@echo off
title Smart Inventory System - Backend (Port 8085)
cd /d "%~dp0backend"
if "%JAVA_HOME%"=="" set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.10"
echo ===================================================
echo  Starting Smart Inventory Spring Boot Backend...
echo ===================================================
..\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=h2
pause
