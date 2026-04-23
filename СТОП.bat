@echo off
title Psycho Archetypes - Остановка

echo.
echo ====================================
echo   Остановка проекта...
echo ====================================
echo.

echo [*] Остановка backend (python.exe)...
taskkill /F /IM python.exe 2>nul
echo [OK] Python процессы остановлены

echo [*] Остановка frontend (node.exe)...
taskkill /F /IM node.exe 2>nul
echo [OK] Node процессы остановлены

echo.
echo ====================================
echo   Проект остановлен
echo ====================================
echo.
pause
