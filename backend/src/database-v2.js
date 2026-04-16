const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../app.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erreur de connexion SQLite:", err);
  } else {
    console.log("✓ Connecté à SQLite");
    initializeDatabase();
  }
});

// Initialiser les tables
function initializeDatabase() {
  db.serialize(() => {
    // Table utilisateurs
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profilePhoto TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table posts (avec shares)
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        photo TEXT,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Table commentaires
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        text TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Table messages
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        receiverId INTEGER NOT NULL,
        text TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (receiverId) REFERENCES users(id)
      )
    `);

    // Table likes
    db.run(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        UNIQUE(postId, userId),
        FOREIGN KEY (postId) REFERENCES posts(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Ajouter le champ shares s'il n'existe pas (migration)
    db.all("PRAGMA table_info(posts)", (err, columns) => {
      if (columns && !columns.find(col => col.name === 'shares')) {
        db.run("ALTER TABLE posts ADD COLUMN shares INTEGER DEFAULT 0", (err) => {
          if (!err) {
            console.log("✓ Colonne 'shares' ajoutée");
          }
        });
      }
    });
  });
}

module.exports = db;
