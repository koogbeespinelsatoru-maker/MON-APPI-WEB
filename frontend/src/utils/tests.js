// Test du Frontend et Backend - À exécuter dans la console du navigateur

const API_URL = "http://localhost:5000";

const Tests = {
  // Test 1: Vérifier que le backend répond
  testBackend: async () => {
    try {
      const response = await fetch(API_URL + "/api/users");
      const data = await response.json();
      console.log("✅ Backend connecté:", data.success ? "OK" : "ERREUR");
      return data.success;
    } catch (err) {
      console.error("❌ Backend non disponible:", err.message);
      return false;
    }
  },

  // Test 2: Tester l'inscription
  testSignup: async (email = "test" + Date.now() + "@email.com", password = "test123") => {
    try {
      const response = await fetch(API_URL + "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email,
          password
        })
      });
      const data = await response.json();
      console.log(data.success ? "✅ Inscription OK" : "❌ Erreur inscription:", data.message);
      return data;
    } catch (err) {
      console.error("❌ Erreur inscription:", err.message);
      return null;
    }
  },

  // Test 3: Vérifier les URLs des photos
  testImages: async () => {
    try {
      const response = await fetch(API_URL + "/api/posts");
      const data = await response.json();
      if (data.success) {
        const postsWithPhotos = data.posts.filter(p => p.photo || p.profilePhoto);
        console.log(`✅ ${data.posts.length} posts trouvés`);
        console.log(`📷 ${postsWithPhotos.length} posts avec photos`);
        return data.posts;
      }
    } catch (err) {
      console.error("❌ Erreur récupération posts:", err.message);
    }
  },

  // Test 4: Vérifier les URLs absolues
  verifyURLs: (posts) => {
    console.log("\n📍 Vérification des URLs:");
    posts.forEach((post, idx) => {
      if (post.photo) {
        const isAbsolute = post.photo.startsWith("http");
        console.log(`Post ${idx}: photo = ${isAbsolute ? "✅ URL absolue" : "❌ Relative"}`);
      }
      if (post.profilePhoto) {
        const isAbsolute = post.profilePhoto.startsWith("http");
        console.log(`Post ${idx}: profil = ${isAbsolute ? "✅ URL absolue" : "❌ Relative"}`);
      }
    });
  },

  // Test 5: Tester les messages
  testMessages: async (userId = 1, targetUserId = 2) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${userId}/${targetUserId}`);
      const data = await response.json();
      console.log(`✅ Messages récupérés: ${data.messages.length}`);
      return data;
    } catch (err) {
      console.error("❌ Erreur messages:", err.message);
    }
  },

  // Test complet
  runAll: async () => {
    console.log("🧪 TESTS EN COURS...\n");
    
    await Tests.testBackend();
    const user = await Tests.testSignup();
    const posts = await Tests.testImages();
    if (posts) Tests.verifyURLs(posts);
    await Tests.testMessages();
    
    console.log("\n✨ Tests terminés!");
  }
};

// Lancer les tests:
// Tests.runAll();

// Ou tests individuels:
// Tests.testBackend();
// Tests.testSignup();
// Tests.testImages();
