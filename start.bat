@echo off
setlocal enabledelayedexpansion

title Mon Appli Web - Demarrage

echo.
echo ╔════════════════════════════════════════════╗
echo ║  🚀  DÉMARRAGE DE L'APPLICATION           ║
echo ║     (Suite des corrections appliquées)    ║
echo ╚════════════════════════════════════════════╝
echo.

REM Vérifier les paramètres
if "%1"=="" goto show_menu
if "%1"=="frontend" goto frontend
if "%1"=="backend" goto backend
if "%1"=="all" goto all
if "%1"=="-help" goto show_help
if "%1"=="/?" goto show_help

:show_menu
echo Choisissez le mode de démarrage:
echo.
echo [1] Mode Complet (Frontend + Backend)  [RECOMMANDÉ]
echo [2] Backend uniquement (API sur :5000)
echo [3] Frontend uniquement (Interface)
echo [4] Voir l'aide
echo [0] Quitter
echo.
set /p choice="Votre choix (0-4): "

if "!choice!"=="1" goto all
if "!choice!"=="2" goto backend
if "!choice!"=="3" goto frontend
if "!choice!"=="4" goto show_help
if "!choice!"=="0" goto end
goto show_menu

:show_help
echo.
echo Usage: start.bat [backend^|frontend^|all]
echo.
echo Modes disponibles:
echo   backend      - Démarre le serveur API (:5000)
echo   frontend     - Démarre l'interface (:5173)
echo   all          - Démarre les deux en parallèle [RECOMMANDÉ]
echo   -help, /?   - Affiche cette aide
echo.
echo Exemples:
echo   start.bat                 - Menu interactif
echo   start.bat all             - Mode complet
echo   start.bat backend         - Backend uniquement
echo.
goto end

:backend
echo.
echo [Backend] Vérification des dépendances...
cd backend
if exist "node_modules" (
    echo ✅ node_modules trouvé
) else (
    echo ⏳ Installation npm (1ère fois - 1-2 minutes)...
    call npm install
    if errorlevel 1 goto error
    echo ✅ Dépendances installées
)
echo.
echo 🔵 Démarrage du serveur Backend...
echo 📌 Accessible sur: http://localhost:5000
echo 📚 Database: app.db (SQLite)
echo 📁 Uploads: ./uploads/
echo.
npm start
goto end

:frontend
echo.
echo [Frontend] Vérification des dépendances...
cd frontend
if exist "node_modules" (
    echo ✅ node_modules trouvé
) else (
    echo ⏳ Installation npm (1ère fois - 1-2 minutes)...
    call npm install
    if errorlevel 1 goto error
    echo ✅ Dépendances installées
)
echo.
echo 🟢 Démarrage du Front-end...
echo 📌 Accessible sur: http://localhost:5173
echo.
npm run dev
goto end

:all
echo.
echo ✓ Vérification des dépendances...
cd backend
if not exist "node_modules" (
    echo ⏳ Backend: Installation npm (1ère fois)...
    call npm install >nul 2>&1
)
cd ..\frontend
if not exist "node_modules" (
    echo ⏳ Frontend: Installation npm (1ère fois)...
    call npm install >nul 2>&1
)
cd ..

echo ✅ Dépendances prêtes
echo.
echo 📊 Ouverture de 2 terminaux...
echo.
echo 🔵 Terminal 1 : Backend (API sur http://localhost:5000)
echo 🟢 Terminal 2 : Frontend (Interface sur http://localhost:5173)
echo.
echo ⏳ Démarrage en cours...
echo.

start "Backend - Mon Appli Web" cmd /k "cd backend && npm start"
timeout /t 4 /nobreak
start "Frontend - Mon Appli Web" cmd /k "cd frontend && npm run dev"

echo.
echo ╔════════════════════════════════════════════╗
echo ║  ✅  DÉMARRAGE RÉUSSI                     ║
echo ║                                            ║
echo ║  🔵 Backend:  http://localhost:5000      ║
echo ║  🟢 Frontend: http://localhost:5173      ║
echo ║                                            ║
echo ║  💡 Les terminaux ont été lancés          ║
echo ║  📖 Voir RESUME.md pour l'utilisation     ║
echo ╚════════════════════════════════════════════╝
echo.
pause
goto end

:error
echo.
echo ❌ ERREUR lors de l'installation npm
echo Pour déboguer:
echo   1. Vérifier que Node.js est installé
echo   2. Vérifier votre connexion internet
echo   3. Voir TROUBLESHOOTING.md
echo.
pause
goto end

:end
exit /b 0
goto end

:end
echo.
