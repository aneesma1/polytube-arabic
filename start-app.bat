@echo off
title PolyTube Player Launcher
echo ======================================================================
echo Launching PolyTube Dual Subtitle YouTube Language Player...
echo Automatically opening: http://localhost:3000
echo ======================================================================
echo.
cd /d "%~dp0"
npm run serve
pause
