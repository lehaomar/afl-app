@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0frontend"
call node_modules\.bin\vite.cmd
