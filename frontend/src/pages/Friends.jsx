import { useState } from "react";
import styles from "./Pages.module.css";

export default function Friends({ users, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <h1>👥 Amis</h1>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Chercher un ami..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.usersList}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              {user.profilePhoto && (
                <img
                  src={`http://localhost:5000${user.profilePhoto}`}
                  alt={user.name}
                  className={styles.userAvatar}
                />
              )}
              <div className={styles.userInfo}>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
              <button
                className={styles.addBtn}
                onClick={() => setSelectedUser(user)}
              >
                Voir le profil
              </button>
            </div>
          ))
        ) : (
          <p className={styles.emptyState}>Aucun ami trouvé</p>
        )}
      </div>

      {selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </button>
            <div className={styles.userDetailCard}>
              {selectedUser.profilePhoto && (
                <img
                  src={`http://localhost:5000${selectedUser.profilePhoto}`}
                  alt={selectedUser.name}
                  className={styles.userDetailAvatar}
                />
              )}
              <h2>{selectedUser.name}</h2>
              <p>{selectedUser.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
