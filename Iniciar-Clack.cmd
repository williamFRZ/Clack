@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0bin\iniciar-clack.ps1" %*
set "clackExit=%ERRORLEVEL%"
echo.
pause
exit /b %clackExit%
