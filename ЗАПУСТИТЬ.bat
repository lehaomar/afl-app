@echo off
title AFL - Запуск приложения
echo.
echo  =============================================
echo   AFL - Сезон 2026/2027 - Запуск серверов
echo  =============================================
echo.

set NODE="C:\Program Files\nodejs\node.exe"

echo  [1/2] Запускаю backend (порт 3001)...
start "AFL Backend" cmd /k "cd /d %~dp0backend && %NODE% server.js"

timeout /t 2 /nobreak >nul

echo  [2/2] Запускаю frontend (порт 5173)...
start "AFL Frontend" cmd /k "cd /d %~dp0frontend && %NODE% node_modules\.bin\vite.cmd"

timeout /t 4 /nobreak >nul

echo.
echo  Открываю браузер...
start http://localhost:5173

echo.
echo  Готово! Приложение открылось в браузере.
echo  Не закрывайте два черных окна - это серверы.
echo.
pause
