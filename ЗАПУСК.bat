@echo off
chcp 65001 >nul
title Psycho Archetypes - Запуск проекта

echo.
echo ====================================
echo   Psycho Archetypes - Запуск
echo ====================================
echo.

REM Проверка Python
echo [*] Проверка Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Python не найден! Установите Python 3.10+
    pause
    exit /b 1
)
echo [OK] Python найден

REM Проверка Node.js
echo [*] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js не найден! Установите Node.js 18+
    pause
    exit /b 1
)
echo [OK] Node.js найден

echo.
echo ====================================
echo   Запуск BACKEND (порт 8000)...
echo ====================================
echo.
start "Backend - Psycho Archetypes" python "%~dp0backend\main.py"

REM Ожидание запуска backend
echo [*] Ожидание запуска backend...
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo   Запуск FRONTEND (порт 3000)...
echo ====================================
echo.
start "Frontend - Psycho Archetypes" powershell -ExecutionPolicy Bypass -Command "cd '%~dp0frontend'; npm run dev"

REM Ожидание запуска frontend
echo [*] Ожидание запуска frontend...
timeout /t 5 /nobreak >nul

echo.
echo ====================================
echo   ГОТОВО!
echo ====================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://127.0.0.1:3000
echo Админка:  http://127.0.0.1:3000/login
echo.
echo Логин: admin
echo Пароль: admin123
echo.
echo ====================================
echo   Нажмите любую клавишу для выхода
echo ====================================
pause >nul
