import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PostForm from "./components/PostForm";
import Post from "./components/Post";
import Messages from "./components/Messages";
import Profile from "./components/Profile";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Videos from "./pages/Videos";
import Trending from "./pages/Trending";
import AdminPanel from "./pages/AdminPanel";
import PhotoGallery from "./components/PhotoGallery";
import styles from "./App.module.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // 🔐 Persistance de session au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        verifyToken(savedToken, userData);
      } catch (err) {
        console.error("Erreur de session:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Vérifier si le token est valide
  const verifyToken = async (tk, userData) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tk}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
          setToken(tk);
          fetchPosts();
          fetchUsers();
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Erreur vérification token:", err);
    }
  };

  // Charger les posts
  const fetchPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    }
  };

  // Au démarrage et quand l'utilisateur change
  useEffect(() => {
    if (currentUser) {
      fetchPosts();
      fetchUsers();
    } else {
      setPosts([]);
      setUsers([]);
    }
  }, [currentUser]);

  const handleLogin = (user, tk) => {
    setCurrentUser(user);
    setToken(tk);
    // Sauvegarder en localStorage pour persistance
    localStorage.setItem("token", tk);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPosts([]);
    setUsers([]);
    setCurrentPage("home");
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setShowMessages(false);
    setShowProfile(false);
    setShowPhotoGallery(false);
  };

  // Si pas connecté, afficher Auth
  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  // Rendu principal
  return (
    <div className={styles.container}>
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onProfileClick={() => {
          setShowProfile(true);
          handleNavigation("profile");
        }}
        onMessagesClick={() => {
          setShowMessages(true);
          handleNavigation("messages");
        }}
        onPhotosClick={() => {
          setShowPhotoGallery(true);
          handleNavigation("photos");
        }}
      />

      <div className={styles.main}>
        <Sidebar 
          onNavigate={handleNavigation}
          currentPage={currentPage}
        />

        <div className={styles.content}>
          {/* Messages Modal */}
          {showMessages && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button 
                  className={styles.closeBtn}
                  onClick={() => setShowMessages(false)}
                >
                  ✕
                </button>
                <Messages currentUser={currentUser} />
              </div>
            </div>
          )}

          {/* Profile Modal */}
          {showProfile && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button 
                  className={styles.closeBtn}
                  onClick={() => setShowProfile(false)}
                >
                  ✕
                </button>
                <Profile 
                  currentUser={currentUser}
                  onProfileUpdate={handleProfileUpdate}
                  token={token}
                />
              </div>
            </div>
          )}

          {/* Photo Gallery Modal */}
          {showPhotoGallery && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button 
                  className={styles.closeBtn}
                  onClick={() => setShowPhotoGallery(false)}
                >
                  ✕
                </button>
                <PhotoGallery userId={currentUser.id} />
              </div>
            </div>
          )}

          {/* Pages */}
          {currentPage === "home" && (
            <>
              <PostForm 
                currentUser={currentUser} 
                onPostCreated={handlePostCreated}
              />
              {loading ? (
                <p>Chargement du fil...</p>
              ) : error ? (
                <p>Erreur lors du chargement des posts</p>
              ) : posts.length === 0 ? (
                <p>Aucun post pour le moment</p>
              ) : (
                posts.map((post) => (
                  <Post 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    onPostUpdated={fetchPosts}
                  />
                ))
              )}
            </>
          )}

          {currentPage === "friends" && (
            <Friends users={users} currentUser={currentUser} />
          )}

          {currentPage === "videos" && (
            <Videos posts={posts.filter(p => p.photo)} />
          )}

          {currentPage === "messages" && (
            <Messages currentUser={currentUser} />
          )}

          {currentPage === "trending" && (
            <Trending posts={posts} />
          )}

          {currentPage === "admin" && (
            <AdminPanel token={token} />
          )}
        </div>
      </div>
    </div>
  );
}
