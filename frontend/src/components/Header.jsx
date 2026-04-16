import { useState } from "react";
import styles from "./Header.module.css";

export default function Header({ currentUser, onLogout, onMessagesClick, onProfileClick, onPhotosClick }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📱</span>
          <span className={styles.logoText}>SocialApp</span>
        </div>

        <div className={styles.search}>
          <input type="text" placeholder="🔍 Rechercher..." />
        </div>

        <div className={styles.userMenu}>
          <button className={styles.iconBtn} onClick={onMessagesClick} title="Messages">
            💬
          </button>
          <button className={styles.iconBtn} onClick={onPhotosClick} title="Photos">
            📷
          </button>
          <button className={styles.iconBtn} onClick={onProfileClick} title="Profil">
            👤
          </button>
          <div className={styles.userProfile} onClick={() => setShowMenu(!showMenu)}>
            {currentUser.profilePhoto ? (
              <img src={`http://localhost:5000${currentUser.profilePhoto}`} alt={currentUser.name} className={styles.userPhoto} />
            ) : (
              <div className={styles.userPhotoPlaceholder}>
                {currentUser.name[0].toUpperCase()}
              </div>
            )}
            <span className={styles.userName}>{currentUser.name}</span>
            <span className={styles.dropdown}>▼</span>
          </div>
          
          {showMenu && (
            <div className={styles.dropdownMenu}>
              <div className={styles.menuItem}>
                {currentUser.profilePhoto ? (
                  <img src={`http://localhost:5000${currentUser.profilePhoto}`} alt={currentUser.name} className={styles.menuUserPhoto} />
                ) : (
                  <div className={styles.menuUserPhotoPlaceholder}>
                    {currentUser.name[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={styles.menuUserName}>{currentUser.name}</div>
                  <div className={styles.menuUserEmail}>{currentUser.email}</div>
                </div>
              </div>
              <hr />
              <button className={styles.menuLink} onClick={() => { onProfileClick(); setShowMenu(false); }}>
                👤 Mon Profil
              </button>
              <button className={styles.menuLink} onClick={() => { onMessagesClick(); setShowMenu(false); }}>
                💬 Messages
              </button>
              <button className={styles.menuLink}>⚙️ Paramètres</button>
              <button className={styles.menuLink}>❓ Aide</button>
              <hr />
              <button className={styles.logoutBtn} onClick={() => { onLogout(); setShowMenu(false); }}>
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
