@echo off
title Image Saver
echo.
echo ==============================================
echo   Product Image Saver
echo ==============================================
echo.
echo   Paste one link:
echo     Product page -> saves that product
echo     Shop page   -> auto-finds ALL products
echo.
echo   Type q to quit.
echo ==============================================
echo.
"%LOCALAPPDATA%\Programs\Python\Python313\python.exe" "%~dp0scraper.py"
pause
