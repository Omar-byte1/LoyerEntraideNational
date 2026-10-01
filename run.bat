@echo off
title Loyer1 - Spring Boot Application
echo ===================================================
echo     Demarrage de l'application Spring Boot Loyer1
echo ===================================================
echo.

rem Vérification si Java est accessible directement
where java >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Java detecte dans le systeme.
    goto RUN
)

rem Si JAVA_HOME est defini, verifier si bin\java.exe existe
if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo [INFO] JAVA_HOME valide : %JAVA_HOME%
        goto RUN
    )
)

rem Recherche automatique dans les dossiers standards
for /d %%D in ("C:\Program Files\Java\jdk*") do (
    if exist "%%D\bin\java.exe" (
        set "JAVA_HOME=%%D"
        goto FOUND
    )
)
for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
    if exist "%%D\bin\java.exe" (
        set "JAVA_HOME=%%D"
        goto FOUND
    )
)

:FOUND
if not "%JAVA_HOME%"=="" if exist "%JAVA_HOME%\bin\java.exe" (
    echo [INFO] JAVA_HOME trouve automatiquement : %JAVA_HOME%
    goto RUN
)

echo ===================================================
echo [ATTENTION] Java JDK 17+ n'a pas ete trouve !
echo ===================================================
echo.
echo Le kit de developpement Java (JDK) doit etre installe pour executer l'application.
echo.
echo 1. Telechargez JDK 17 (ex: Temurin / Eclipse Adoptium ou Oracle JDK) :
echo    https://adoptium.net/
echo.
echo 2. Si JDK est deja installe dans un dossier specifique (ex: D:\jdk17), 
echo    ouvrez ce fichier (run.bat) et ajoutez au debut :
echo    set "JAVA_HOME=C:\votre\dossier\jdk"
echo.
pause
exit /b 1

:RUN
echo [INFO] Lancement du serveur Spring Boot...
echo.
call .\mvnw.cmd spring-boot:run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] Le serveur s'est arrete avec des erreurs.
    pause
)
