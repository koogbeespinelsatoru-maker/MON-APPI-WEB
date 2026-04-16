// Fichier pour vérifier les URLs des images
// À utiliser dans la console du navigateur pour tester

const testImageURLs = {
  baseURL: "http://localhost:5000",
  
  // Test 1: Télécharger une image de profil
  testProfilePhoto: async () => {
    const formData = new FormData();
    const file = new File(["test"], "test.png", { type: "image/png" });
    formData.append("photo", file);
    
    const response = await fetch("http://localhost:5000/api/users/1/photo", {
      method: "PUT",
      body: formData
    });
    return response.json();
  },
  
  // Test 2: Vérifier que l'URL est correcte
  verifyImageURL: (photoPath) => {
    if (!photoPath) return null;
    // Si le chemin commence par /, préfixer avec le baseURL
    if (photoPath.startsWith("/")) {
      return `http://localhost:5000${photoPath}`;
    }
    return photoPath;
  },
  
  // Test 3: Afficher tous les posts avec images
  checkPostImages: async () => {
    const response = await fetch("http://localhost:5000/api/posts");
    const data = await response.json();
    if (data.success) {
      return data.posts.map(post => ({
        id: post.id,
        content: post.content,
        photoURL: testImageURLs.verifyImageURL(post.photo),
        authorPhoto: testImageURLs.verifyImageURL(post.profilePhoto)
      }));
    }
  }
};

// À exécuter dans la console:
// testImageURLs.checkPostImages().then(console.log)
