// Données d'exemple pour tester l'application
// Importer ce fichier dans la base de données SQLite via une migration

// Utilisateurs de test (mots de passe = "test123" - hashés avec bcryptjs)
// Pour générer les hashes, utiliser:
// const hashedPassword = await bcryptjs.hash("test123", 10);

const testData = {
  users: [
    {
      name: "Alice Dupont",
      email: "alice@test.com",
      password: "test123" // À hasher
    },
    {
      name: "Bob Martin",
      email: "bob@test.com",
      password: "test123" // À hasher
    },
    {
      name: "Carol Lefevre",
      email: "carol@test.com",
      password: "test123" // À hasher
    }
  ],

  posts: [
    {
      userId: 1,
      content: "Bienvenue sur ma page! 👋",
      photo: null
    },
    {
      userId: 2,
      content: "Première publication! L'application fonctionne magnifiquement! 🎉",
      photo: null
    }
  ],

  comments: [
    {
      postId: 1,
      userId: 2,
      text: "Sympa ton profil Alice! 😊"
    },
    {
      postId: 2,
      userId: 1,
      text: "Bob c'est super! Bienvenue! 🎊"
    }
  ],

  messages: [
    {
      senderId: 1,
      receiverId: 2,
      text: "Salut Bob! Comment ça va?"
    },
    {
      senderId: 2,
      receiverId: 1,
      text: "Ça va super Alice! Et toi?"
    }
  ]
};

module.exports = testData;
