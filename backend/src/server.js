const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

const JWT_SECRET = "votre_secret_key_super_securise_12345";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Dossier uploads
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques
app.use("/uploads", express.static(uploadsDir));

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"));
    }
  }
});

// ===== AUTHENTIFICATION =====

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token requis" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
};

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
  }

  try {
    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }

      if (row) {
        return res.status(400).json({ success: false, message: "Cet email existe déjà" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        function (err) {
          if (err) {
            return res.status(500).json({ success: false, message: "Erreur lors de la création" });
          }

          const user = { id: this.lastID, name, email, profilePhoto: null };
          const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

          res.json({
            success: true,
            user,
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
  }

  try {
    db.get(
      "SELECT id, name, email, password, profilePhoto FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err || !user) {
          return res.status(401).json({ success: false, message: "Identifiants incorrects" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "Identifiants incorrects" });
        }

        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePhoto: user.profilePhoto
        };

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
          success: true,
          user: userData,
          token
        });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post("/api/auth/verify", verifyToken, (req, res) => {
  db.get(
    "SELECT id, name, email, profilePhoto FROM users WHERE id = ?",
    [req.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
      res.json({ success: true, user });
    }
  );
});

// ===== PROFIL UTILISATEUR =====

app.get("/api/users", (req, res) => {
  db.all(
    "SELECT id, name, email, profilePhoto FROM users",
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.json({ success: true, users });
    }
  );
});

app.get("/api/users/:id", (req, res) => {
  db.get(
    "SELECT id, name, email, profilePhoto FROM users WHERE id = ?",
    [req.params.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
      res.json({ success: true, user });
    }
  );
});

app.put("/api/users/:id", verifyToken, (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Nom et email requis" });
  }

  db.run(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour" });
      }
      db.get(
        "SELECT id, name, email, profilePhoto FROM users WHERE id = ?",
        [req.params.id],
        (err, user) => {
          res.json({ success: true, user });
        }
      );
    }
  );
});

app.put("/api/users/:id/photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Aucune image fournie" });
  }

  const photoUrl = `/uploads/${req.file.filename}`;

  db.run(
    "UPDATE users SET profilePhoto = ? WHERE id = ?",
    [photoUrl, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      db.get(
        "SELECT id, name, email, profilePhoto FROM users WHERE id = ?",
        [req.params.id],
        (err, user) => {
          res.json({ success: true, user });
        }
      );
    }
  );
});

app.get("/api/users/:id/photos", (req, res) => {
  db.all(
    `SELECT p.id, p.photo, p.timestamp FROM posts 
     WHERE userId = ? AND photo IS NOT NULL 
     ORDER BY p.timestamp DESC`,
    [req.params.id],
    (err, photos) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.json({ success: true, photos: photos || [] });
    }
  );
});

// ===== POSTS =====

app.get("/api/posts", (req, res) => {
  db.all(
    `SELECT p.id, p.userId, p.content, p.photo, p.likes, p.timestamp, u.name, u.profilePhoto
     FROM posts p
     JOIN users u ON p.userId = u.id
     ORDER BY p.timestamp DESC`,
    [],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }

      Promise.all(
        posts.map(
          (post) =>
            new Promise((resolve) => {
              db.all(
                `SELECT c.id, c.text, c.userId, c.timestamp, u.name FROM comments c
                 JOIN users u ON c.userId = u.id
                 WHERE c.postId = ? ORDER BY c.timestamp ASC`,
                [post.id],
                (err, comments) => {
                  post.comments = comments || [];
                  resolve(post);
                }
              );
            })
        )
      ).then((postsWithComments) => {
        res.json({ success: true, posts: postsWithComments });
      });
    }
  );
});

app.get("/api/users/:id/posts", (req, res) => {
  db.all(
    `SELECT p.id, p.userId, p.content, p.photo, p.likes, p.shares, p.timestamp, u.name, u.profilePhoto
     FROM posts p
     JOIN users u ON p.userId = u.id
     WHERE p.userId = ?
     ORDER BY p.timestamp DESC`,
    [req.params.id],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      Promise.all(
        posts.map(
          (post) =>
            new Promise((resolve) => {
              db.all(
                `SELECT c.id, c.text, c.userId, c.timestamp, u.name FROM comments c
                 JOIN users u ON c.userId = u.id
                 WHERE c.postId = ? ORDER BY c.timestamp ASC`,
                [post.id],
                (err, comments) => {
                  post.comments = comments || [];
                  resolve(post);
                }
              );
            })
        )
      ).then((postsWithComments) => {
        res.json({ success: true, posts: postsWithComments });
      });
    }
  );
});

app.post("/api/posts", upload.single("photo"), (req, res) => {
  const { content, userId } = req.body;

  if (!content || !userId) {
    return res.status(400).json({ success: false, message: "Contenu et userId requis" });
  }

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    "INSERT INTO posts (userId, content, photo) VALUES (?, ?, ?)",
    [userId, content, photoUrl],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur lors de la création" });
      }

      db.get(
        `SELECT p.id, p.userId, p.content, p.photo, p.likes, p.shares, p.timestamp, u.name, u.profilePhoto
         FROM posts p
         JOIN users u ON p.userId = u.id
         WHERE p.id = ?`,
        [this.lastID],
        (err, post) => {
          post.comments = [];
          res.json({ success: true, post });
        }
      );
    }
  );
});

// ===== LIKES =====

app.post("/api/posts/:id/like", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId requis" });
  }

  db.get(
    "SELECT id FROM post_likes WHERE postId = ? AND userId = ?",
    [req.params.id, userId],
    (err, row) => {
      if (row) {
        // Unlike
        db.run(
          "DELETE FROM post_likes WHERE postId = ? AND userId = ?",
          [req.params.id, userId],
          () => {
            db.run(
              "UPDATE posts SET likes = likes - 1 WHERE id = ?",
              [req.params.id],
              () => {
                fetchPost(req.params.id, res);
              }
            );
          }
        );
      } else {
        // Like
        db.run(
          "INSERT INTO post_likes (postId, userId) VALUES (?, ?)",
          [req.params.id, userId],
          () => {
            db.run(
              "UPDATE posts SET likes = likes + 1 WHERE id = ?",
              [req.params.id],
              () => {
                fetchPost(req.params.id, res);
              }
            );
          }
        );
      }
    }
  );
});

function fetchPost(postId, res) {
  db.get(
    `SELECT p.id, p.userId, p.content, p.photo, p.likes, p.shares, p.timestamp, u.name, u.profilePhoto
     FROM posts p
     JOIN users u ON p.userId = u.id
     WHERE p.id = ?`,
    [postId],
    (err, post) => {
      db.all(
        `SELECT c.id, c.text, c.userId, c.timestamp, u.name FROM comments c
         JOIN users u ON c.userId = u.id
         WHERE c.postId = ? ORDER BY c.timestamp ASC`,
        [postId],
        (err, comments) => {
          post.comments = comments || [];
          res.json({ success: true, post });
        }
      );
    }
  );
}

app.post("/api/posts/:id/share", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId requis" });
  }
  db.run(
    "UPDATE posts SET shares = shares + 1 WHERE id = ?",
    [req.params.id],
    () => {
      db.get(
        "SELECT content, photo FROM posts WHERE id = ?",
        [req.params.id],
        (err, originalPost) => {
          if (err || !originalPost) {
            return res.status(404).json({ success: false, message: "Post non trouvé" });
          }
          const sharedContent = `[Partagé] ${originalPost.content}`;
          db.run(
            "INSERT INTO posts (userId, content, photo) VALUES (?, ?, ?)",
            [userId, sharedContent, originalPost.photo],
            () => {
              fetchPost(req.params.id, res);
            }
          );
        }
      );
    }
  );
});

// ===== COMMENTAIRES =====

app.post("/api/posts/:id/comment", (req, res) => {
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ success: false, message: "userId et text requis" });
  }

  db.run(
    "INSERT INTO comments (postId, userId, text) VALUES (?, ?, ?)",
    [req.params.id, userId, text],
    () => {
      fetchPost(req.params.id, res);
    }
  );
});

// ===== MESSAGERIE =====

app.get("/api/messages/:userId", (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT m.id, m.senderId, m.receiverId, m.text, m.timestamp, 
            u1.name as senderName, u2.name as receiverName
     FROM messages m
     JOIN users u1 ON m.senderId = u1.id
     JOIN users u2 ON m.receiverId = u2.id
     WHERE (m.senderId = ? OR m.receiverId = ?)
     ORDER BY m.timestamp DESC`,
    [userId, userId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.json({ success: true, messages: messages || [] });
    }
  );
});

app.get("/api/messages/:userId/:otherUserId", (req, res) => {
  const { userId, otherUserId } = req.params;

  db.all(
    `SELECT m.id, m.senderId, m.receiverId, m.text, m.timestamp,
            u1.name as senderName, u2.name as receiverName
     FROM messages m
     JOIN users u1 ON m.senderId = u1.id
     JOIN users u2 ON m.receiverId = u2.id
     WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
     ORDER BY m.timestamp ASC`,
    [userId, otherUserId, otherUserId, userId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.json({ success: true, messages: messages || [] });
    }
  );
});

app.post("/api/messages", (req, res) => {
  const { senderId, receiverId, text } = req.body;

  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ success: false, message: "Champs requis manquants" });
  }

  db.run(
    "INSERT INTO messages (senderId, receiverId, text) VALUES (?, ?, ?)",
    [senderId, receiverId, text],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur lors de l'envoi" });
      }

      db.get(
        `SELECT m.id, m.senderId, m.receiverId, m.text, m.timestamp,
                u1.name as senderName, u2.name as receiverName
         FROM messages m
         JOIN users u1 ON m.senderId = u1.id
         JOIN users u2 ON m.receiverId = u2.id
         WHERE m.id = ?`,
        [this.lastID],
        (err, message) => {
          res.json({ success: true, message });
        }
      );
    }
  );
});

// ===== DÉMARRAGE SERVEUR =====

app.get("/api/admin/users", (req, res) => {
  db.all(
    `SELECT id, name, email, profilePhoto, (SELECT COUNT(*) FROM posts WHERE userId = users.id) as postCount,
            (SELECT COUNT(*) FROM messages WHERE senderId = users.id OR receiverId = users.id) as messageCount
     FROM users`,
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.json({ success: true, users });
    }
  );
});

app.get("/api/admin/posts", (req, res) => {
  db.all(
    `SELECT p.id, p.userId, p.content, p.photo, p.likes, p.shares, p.timestamp, u.name, u.email,
            (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentCount
     FROM posts p
     JOIN users u ON p.userId = u.id
     ORDER BY p.timestamp DESC`,
    [],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.json({ success: true, posts });
    }
  );
});

app.get("/api/admin/stats", (req, res) => {
  const stats = {};
  db.all("SELECT COUNT(*) as count FROM users", [], (err, result) => {
    stats.totalUsers = result[0].count;
    db.all("SELECT COUNT(*) as count FROM posts", [], (err, result) => {
      stats.totalPosts = result[0].count;
      db.all("SELECT COUNT(*) as count FROM comments", [], (err, result) => {
        stats.totalComments = result[0].count;
        db.all("SELECT COUNT(*) as count FROM messages", [], (err, result) => {
          stats.totalMessages = result[0].count;
          res.json({ success: true, stats });
        });
      });
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur v2 démarré sur http://localhost:${PORT}`);
  console.log("✓ JWT authentication enabled");
  console.log("✓ Admin panel: /api/admin/*");
  console.log("✓ Upload folder: ./uploads\n");
});
