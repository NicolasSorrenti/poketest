@echo off
cd /d "%~dp0"
set PORT=8000
set HOST=127.0.0.1
echo Neo Campus Online starts at http://localhost:8000/online.html
echo Keep this window open while your friends play.
echo Use SHARE_WITH_CLOUDFLARE.bat in a second window for a temporary public URL.
echo.
npm start
pause
