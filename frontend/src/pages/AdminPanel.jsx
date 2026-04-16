import { useState, useEffect } from "react";
import styles from "./Pages.module.css";

export default function AdminPanel({ token }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Stats
      const statsRes = await fetch("http://localhost:5000/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Users
      const usersRes = await fetch("http://localhost:5000/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

      // Posts
      const postsRes = await fetch("http://localhost:5000/api/admin/posts");
      const postsData = await postsRes.json();
      if (postsData.success) setPosts(postsData.posts);
    } catch (err) {
      console.error("Erreur chargement admin:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className={styles.adminPanel}>
      <h1>⚙️ Panneau d'Administration</h1>

      <div className={styles.adminTabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === "stats" ? styles.active : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📊 Statistiques
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "users" ? styles.active : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Utilisateurs
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "posts" ? styles.active : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          📝 Publications
        </button>
      </div>

      {/* Statistiques */}
      {activeTab === "stats" && stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>👥 Utilisateurs</h3>
            <p className={styles.statNumber}>{stats.totalUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3>📝 Publications</h3>
            <p className={styles.statNumber}>{stats.totalPosts}</p>
          </div>
          <div className={styles.statCard}>
            <h3>💬 Commentaires</h3>
            <p className={styles.statNumber}>{stats.totalComments}</p>
          </div>
          <div className={styles.statCard}>
            <h3>💌 Messages</h3>
            <p className={styles.statNumber}>{stats.totalMessages}</p>
          </div>
        </div>
      )}

      {/* Utilisateurs */}
      {activeTab === "users" && (
        <div className={styles.dataTable}>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Publications</th>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userRow}>
                      {user.profilePhoto && (
                        <img
                          src={`http://localhost:5000${user.profilePhoto}`}
                          alt={user.name}
                          className={styles.smallAvatar}
                        />
                      )}
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.postCount}</td>
                  <td>{user.messageCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Publications */}
      {activeTab === "posts" && (
        <div className={styles.dataTable}>
          <table>
            <thead>
              <tr>
                <th>Contenu</th>
                <th>Auteur</th>
                <th>Likes</th>
                <th>Partages</th>
                <th>Commentaires</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.content.substring(0, 50)}...</td>
                  <td>{post.name}</td>
                  <td>{post.likes}</td>
                  <td>{post.shares}</td>
                  <td>{post.commentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
