import styles from "./Sidebar.module.css";

export default function Sidebar({ onNavigate, currentPage }) {
  const menuItems = [
    { icon: "🏠", label: "Accueil", page: "home" },
    { icon: "👥", label: "Amis", page: "friends" },
    { icon: "📺", label: "Vidéos", page: "videos" },
    { icon: "💬", label: "Messages", page: "messages" },
    { icon: "🔥", label: "Tendances", page: "trending" },
    { icon: "⚙️", label: "Admin", page: "admin" }
  ];

  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav}>
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`${styles.menuItem} ${
              currentPage === item.page ? styles.active : ""
            }`}
            onClick={() => onNavigate(item.page)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
