@echo off
cd /d "%~dp0"
set PORT=8000
set HOST=0.0.0.0
echo LAN mode: use ipconfig to find your PC's private IPv4 address.
echo Friends on the SAME Wi-Fi can open http://YOUR-IP:8000/online.html
 echo Windows Firewall may require permission for Node.js on Private networks.
echo This is NOT a public internet tunnel; use Cloudflare to play from elsewhere.
echo.
npm start
pause
