@echo off
TITLE Digital Twin - Launch Pad
echo [1/4] Starting MongoDB Intelligence Core...
start "Digital Twin: MongoDB" /min cmd /c "mongod --dbpath ./data --bind_ip 127.0.0.1"
timeout /t 3

echo [2/4] Starting AI Neural Service (Port 8600)...
start "Digital Twin: AI Service" /min cmd /c "cd ai-service && python main.py"
timeout /t 2

echo [3/4] Starting Backend Hub (Port 5604)...
start "Digital Twin: Server" /min cmd /c "cd server && npm run dev"
timeout /t 2

echo [4/4] Launching Frontend Interface (Port 5673)...
start "Digital Twin: Client" cmd /c "cd client && npm run dev"

echo.
echo ======================================================
echo    DIGITAL TWIN SERVICES ACTIVE
echo ======================================================
echo  - Frontend:  http://127.0.0.1:5673
echo  - Backend:   http://127.0.0.1:5604
echo  - AI Agency: http://127.0.0.1:8600
echo ======================================================
echo.
pause
