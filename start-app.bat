@echo off
REM Taktak Application Startup Script
REM This script starts both server and client in separate windows

echo.
echo ========================================
echo   Starting Taktak Application
echo ========================================
echo.

REM Start server in a new window
echo [INFO] Starting server in new window...
start "Taktak Server" cmd /k "%~dp0start-server.bat"

REM Wait a moment for server to start
timeout /t 2 /nobreak >nul

REM Start client in a new window
echo [INFO] Starting client in new window...
start "Taktak Client" cmd /k "%~dp0start-client.bat"

echo.
echo ========================================
echo   Taktak is starting!
echo ========================================
echo.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Two command windows have been opened.
echo Close them to stop the application.
echo.
pause

