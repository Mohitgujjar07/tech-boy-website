@echo off
title Tech Boy Solutions — Local Server
echo ========================================================
echo Starting Tech Boy Solutions on http://localhost:3000 ...
echo ========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
