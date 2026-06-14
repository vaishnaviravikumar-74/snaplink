@echo off
echo ========================================
echo   SnapLink - Installing dependencies...
echo ========================================

cd server
call npm install
cd ..

cd client
call npm install
cd ..

echo ========================================
echo   Starting SnapLink...
echo   Backend  -> http://localhost:5000
echo   Frontend -> http://localhost:5173
echo ========================================

start cmd /k "cd server && npm run dev"
timeout /t 3
start cmd /k "cd client && npm run dev"

echo Both servers are starting...
echo Open http://localhost:5173 in your browser!
pause
