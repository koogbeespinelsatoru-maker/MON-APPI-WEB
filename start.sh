#!/bin/bash
# Script de démarrage rapidement (Linux/Mac)
# Pour Windows, utiliser: start.bat all

echo "🚀 Démarrage de l'application complète..."
echo ""

# Vérifier les dépendances
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installation dépendances Backend..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installation dépendances Frontend..."
  cd frontend && npm install && cd ..
fi

echo ""
echo "🔄 Démarrage des serveurs..."
echo ""

# Démarrer le backend
echo "🗄️  Démarrage Backend (port 5000)..."
cd backend && npm start &
BACKEND_PID=$!

# Attendre que le backend démarre
sleep 3

# Démarrer le frontend
echo "💻 Démarrage Frontend (port 5173)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Serveurs démarrés!"
echo "📍 Frontend  : http://localhost:5173"
echo "📍 Backend   : http://localhost:5000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter..."
echo ""

# Garder le script en cours d'exécution
wait
