## 🔧 GUIDE DE DÉPANNAGE

### ❌ Problème: "Erreur de connexion à l'API"

**Cause probable:** Le backend n'est pas démarré
**Solution:**
```bash
cd backend
npm start
# Vous devriez voir:
# 🚀 Serveur démarré sur http://localhost:5000
# ✓ SQLite initialized
# ✓ Upload folder: ./uploads
```

---

### ❌ Problème: Les photos ne s'affichent pas

**Cause 1:** URLs mal formatées
```javascript
// ❌ INCORRECT (ce qui se passait avant):
// /uploads/photo-123.jpg
// Solution: Vérifier dans browser DevTools > Network pour voir l'URL réelle

// ✅ CORRECT (après correction):
// http://localhost:5000/uploads/photo-123.jpg
```

**Cause 2:** Le dossier `backend/uploads/` n'existe pas
```bash
# Vérifier:
ls backend/uploads/      # Doit afficher les images uploadés
# Si vide ou n'existe pas, créer:
mkdir -p backend/uploads
```

**Cause 3:** Permissions d'écriture manquantes
```bash
# Linux/Mac:
chmod 755 backend/uploads

# Windows: Clic droit > Propriétés > Sécurité > Éditer
```

---

### ❌ Problème: Les images uploadées ne s'affichent pas après upload

**Symptôme:** Upload réussit, mais l'image n'apparaît pas dans le profil

**Étapes de debug:**

1. **Ouvrir DevTools (F12) > Console**
2. **Vérifier l'URL renvoyée:**
```javascript
// Console:
// Créer un post avec photo
// Puis vérifier dans Console > Network > Posts
// Chercher le champ "photo" de la réponse

// Doit être: "/uploads/photo-123456789.jpg"
```

3. **Vérifier l'URL affichée dans img src:**
```javascript
// Console:
document.querySelector('img').src
// Doit être: "http://localhost:5000/uploads/photo-123456789.jpg"
```

4. **Tester l'URL directement:**
```
Dans le navigateur:
http://localhost:5000/uploads/photo-123456789.jpg

Si c'est une 404, vérifier:
- Le fichier existe dans backend/uploads/
- Le backend sert les uploads (middleware express.static)
```

---

### ❌ Problème: "userId is undefined" sur les likes

**Cause:** L'app ne reçoit pas l'ID utilisateur
**Solution:** Vérifier dans App.jsx:
```javascript
const handleLike = async (postId) => {
  const response = await fetch(..., {
    body: JSON.stringify({ userId: currentUser.id })  // ✅ userId doit être présent
  });
};
```

---

### ❌ Problème: "Cannot read property 'profilePhoto' of null"

**Cause:** L'utilisateur n'est pas connecté
**Solution:** Vérifier le flow d'authentification:
```javascript
// En App.jsx:
if (!currentUser) {
  return <Auth onLogin={handleLogin} />;  // ✅ Doit afficher Auth si null
}
```

---

### ❌ Problème: Messages ne s'envoient pas

**Symptôme:** Clic sur "Envoyer", rien ne se passe

**Steps:**
1. Ouvrir DevTools > Network
2. Envoyer un message
3. Vérifier la requête POST `/api/messages`
4. Réponse doit être: `{ success: true, message: {...} }`
5. Si erreur, vérifier:
   - `senderId` et `receiverId` sont des nombres
   - `text` n'est pas vide
   - L'utilisateur cible existe dans la base

---

### ❌ Problème: "Cannot find module 'sqlite3'"

**Cause:** Dépendances pas installées
**Solution:**
```bash
cd backend
npm install
# Puis:
npm start
```

---

### ❌ Problème: Port 5000 déjà en utilisation

**Symptôme:** "EADDRINUSE: address already in use :::5000"

**Solution:**
```bash
# Trouver le processus utilisant le port:
# Windows:
netstat -ano | findstr :5000

# Puis le tuer (remplacer PID par le numéro):
taskkill /PID <PID> /F

# Ou juste changer le port dans server.js:
const PORT = 5001;  // Changer de 5000 à 5001
```

---

### ❌ Problème: CORS error "No 'Access-Control-Allow-Origin' header"

**Cause:** Misconfiguration CORS
**Verification dans server.js:**
```javascript
app.use(cors());  // ✅ Doit être au démarrage
```

**Si encore une erreur:**
```javascript
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
```

---

### ✅ CHECKLIST DE TEST

Avant de déclarer que tout fonctionne:

- [ ] Backend démarre sans erreur
- [ ] Frontend se connecte à http://localhost:5173
- [ ] Créer un compte fonctionne
- [ ] Login fonctionne
- [ ] Ajouter une photo de profil fonctionne
- [ ] La photo apparaît dans le profil
- [ ] Créer un post sans photo fonctionne
- [ ] Créer un post avec photo fonctionne
- [ ] Les photos des posts s'affichent
- [ ] Les likes fonctionnent
- [ ] Les commentaires fonctionnent
- [ ] Les messages s'envoient
- [ ] Aucune démo hardcodée visible

### 🚨 Logs Importants à Vérifier

**Backend logs:**
```
✓ Connecté à SQLite
✓ Upload folder: ./uploads
🚀 Serveur démarré sur http://localhost:5000
```

**Frontend console (F12):**
```
Doit être VIDE de erreurs (peut avoir des warnings)
```

---

### 🆘 Si Rien Ne Fonctionne

1. **Supprimer cache et recommencer:**
```bash
# Backend:
rm backend/app.db
npm start

# Frontend:
rm -rf node_modules
npm install
npm run dev
```

2. **Vérifier les versions Node:**
```bash
node --version  # Doit être v16+ 
npm --version   # Doit être v8+
```

3. **Créer une issue (fournir):**
- Output exacte du backend
- Erreurs dans console frontend
- URL qui ne charge pas
- Quel navigateur + OS
