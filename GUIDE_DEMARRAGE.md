# 🚀 Guide de Démarrage - Application Web Corrigée

## ✅ Fonctionnalités Implémentées

### 🗄️ Backend - SQLite + Sécurité
- ✅ **Base de données SQLite** - Persistance des données locales
- ✅ **Mots de passe sécurisés** - Hashés avec bcryptjs (10 rounds)
- ✅ **Upload de photos** - Multer pour profil + posts
- ✅ **Messagerie complète** - Entre utilisateurs
- ✅ **Stockage local** - Dossier `/uploads` automatique

### 💻 Frontend - Améliorations
- ✅ **Upload photos dans posts** - Avec aperçu
- ✅ **Galerie de photos** - Affichage dans les posts
- ✅ **Interface de messagerie** - Chat en temps réel
- ✅ **Photo de profil** - Changeable facilement

---

## 🎯 Démarrage de l'Application

### 1️⃣ Terminal 1 - Backend

```bash
cd backend
npm install      # Première fois seulement
npm start        # Démarre le serveur sur http://localhost:5000
```

**Output attendu :**
```
🚀 Serveur démarré sur http://localhost:5000
✓ SQLite initialized
✓ Upload folder: ./uploads
✓ Connecté à SQLite
```

### 2️⃣ Terminal 2 - Frontend

```bash
cd frontend
npm install      # Première fois seulement
npm run dev      # Démarre Vite sur http://localhost:5173
```

---

## 📁 Structure de Données

### Base de Données SQLite (`backend/app.db`)
```
✓ users           → Profils, emails, mots de passe hashés
✓ posts           → Contenu, photos de posts
✓ comments        → Commentaires sur les posts
✓ messages        → Messages privés entre utilisateurs
✓ post_likes      → Tracking des likes
```

### Dossier Uploads (`backend/uploads/`)
```
photos/
├── profil-photo-1234567890.jpg
└── post-photo-0987654321.png
```

---

## 🔐 Système de Sécurité

### Authentification
1. **Inscription** - Création d'un compte avec email unique
2. **Login** - Vérification du mot de passe hashé
3. **Tokens** - (À ajouter pour sessions persistentes)

### Mots de Passe
```javascript
// Avant stockage - BCRYPTJS (10 rounds)
password: "demo123" → "$2a$10$...hashé..."

// À la connexion - Comparaison sécurisée
bcryptjs.compare("demo123", "$2a$10$...") → true/false
```

---

## 📡 APIEndpoints Principaux

### Authentification
```
POST   /api/auth/signup        - Créer un compte
POST   /api/auth/login         - Se connecter
```

### Utilisateurs
```
GET    /api/users              - Tous les utilisateurs
GET    /api/users/:id          - Profil d'un utilisateur
PUT    /api/users/:id/photo    - Upload photo de profil
```

### Posts
```
GET    /api/posts              - Tous les posts
POST   /api/posts              - Créer un post (+ photo optionnelle)
POST   /api/posts/:id/like     - Liker/Unliker un post
POST   /api/posts/:id/comment  - Ajouter un commentaire
```

### Messagerie
```
GET    /api/messages/:userId/:otherUserId    - Messages entre deux utilisateurs
POST   /api/messages                          - Envoyer un message
```

---

## 🧪 Test Rapide

### 1. Créer un compte
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"demo123"}'
```

### 2. Se connecter
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"demo123"}'
```

### 3. Créer un post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"content":"Bonjour le monde!"}'
```

---

## 🎨 Interface Utilisateur

### Page d'Accueil
- Authentification (Login/Signup)
- Fil d'actualité avec posts

### Sidebar
- Onglets : Accueil, Messages, Profil

### Messages 💬
- Liste des utilisateurs
- Chat en temps réel
- Horodatage des messages

### Profil 👤
- Photo de profil (éditable)
- Informations personnelles
- Gestion de compte

---

## 🔧 Technologies Utilisées

### Backend
```
ExpressJS       - Serveur web
SQLite3         - Base de données
Bcryptjs        - Hashage de mots de passe
Multer          - Gestion des uploads
CORS            - Partage de ressources cross-origin
```

### Frontend
```
React 18        - Interface
Vite            - Build tool
CSS Modules     - Styles scoped
Fetch API       - Requêtes serveur
```

---

## 📋 À faire Ensuite (Améliorations)

- [ ] Ajouter JWT pour sessions persistantes
- [ ] Notifications en temps réel (Socket.io)
- [ ] Recherche d'utilisateurs
- [ ] Blocage d'utilisateurs
- [ ] Suppression de posts/messages
- [ ] Édition de posts
- [ ] Pagination des posts
- [ ] Compression d'images
- [ ] Déploiement (Heroku, Vercel, Azure)

---

## 🐛 Troubleshooting

### Le serveur ne démarre pas
```bash
# Vérifier les dépendances
cd backend && npm install
npm start
```

### CORS errors
- Vérifier que le serveur est sur `http://localhost:5000`
- Frontend sur `http://localhost:5173`

### Uploads ne fonctionnent pas
- Vérifier le dossier `backend/uploads` existe
- Permissions d'écriture sur le dossier

### SQLite errors
- Supprimer `backend/app.db` pour réinitialiser la base
- Vérifier que sqlite3 est installé: `npm list sqlite3`

---

## 📞 Support

Pour les questions ou bugs, consultez la documentation :
- Express: https://expressjs.com/
- SQLite3: https://www.sqlite.org/
- Multer: https://github.com/expressjs/multer
- React: https://react.dev/
