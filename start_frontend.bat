@echo off
title Smart Inventory System - Frontend (Port 5173)
cd /d "%~dp0frontend"
echo ===================================================
echo  Starting Smart Inventory React Frontend...
echo ===================================================
call npm.cmd run dev
pause
