@echo off
TITLE Digital Twin - Shutdown
echo Terminating Digital Twin Ecosystem...

echo [1/3] Stopping Node.js Processes (Server & Client)...
taskkill /F /IM node.exe /T 2>nul

echo [2/3] Stopping AI Service (Python)...
taskkill /F /IM python.exe /T 2>nul

echo [3/3] Stopping Database Core (MongoDB)...
taskkill /F /IM mongod.exe /T 2>nul

echo.
echo ======================================================
echo    ALL DIGITAL TWIN SERVICES TERMINATED
echo ======================================================
echo.
pause
