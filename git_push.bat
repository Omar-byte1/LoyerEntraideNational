@echo off
title Push vers GitHub - Loyer1
echo ===================================================
echo     Publication du projet Loyer1 sur GitHub
echo ===================================================
echo.

set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"

if not exist "%GIT_EXE%" (
    echo [ERREUR] Git n'a pas ete trouve dans C:\Program Files\Git\cmd\git.exe
    pause
    exit /b 1
)

echo [INFO] Configuration identite Git...
"%GIT_EXE%" config --global user.email "bakri3319@gmail.com"
"%GIT_EXE%" config --global user.name "omar-byte1"

echo [INFO] Initialisation du depot local...
"%GIT_EXE%" init

echo [INFO] Ajout des fichiers...
"%GIT_EXE%" add .

echo [INFO] Creation du commit...
"%GIT_EXE%" commit -m "Initial commit - Loyer1 Fullstack Application"

echo [INFO] Liaison avec GitHub...
"%GIT_EXE%" branch -M main
"%GIT_EXE%" remote add origin https://github.com/Omar-byte1/LoyerEntraideNational.git 2>nul

echo [INFO] Envoi des fichiers vers GitHub...
"%GIT_EXE%" push -u origin main

echo.
echo ===================================================
echo     Operation de publication terminee !
echo ===================================================
pause
