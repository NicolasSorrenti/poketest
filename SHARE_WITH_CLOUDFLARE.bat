@echo off
cd /d "%~dp0"
where cloudflared >nul 2>&1
if errorlevel 1 (
 echo cloudflared is not installed or not on PATH.
 echo Install Cloudflare's cloudflared first:
 echo https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
 pause
 exit /b 1
)
echo First start START_ONLINE_LOCAL.bat in another window.
echo Open the temporary HTTPS address that appears below, add /online.html, and share it with your friend.
echo The tunnel ends when this window closes.
echo.
cloudflared tunnel --url http://127.0.0.1:8000
pause
