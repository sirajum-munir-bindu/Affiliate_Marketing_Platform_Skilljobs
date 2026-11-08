@echo off
start "next-server" /b cmd /c "npx.cmd next start -p 3000"
ping 127.0.0.1 -n 5 > nul
node tests/test-e2e.mjs
set TEST_STATUS=%ERRORLEVEL%
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
  taskkill /f /pid %%a > nul 2>&1
)
exit /b %TEST_STATUS%
