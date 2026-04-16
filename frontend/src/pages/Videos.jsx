import styles from "./Pages.module.css";

export default function Videos({ posts }) {
  const videoPosts = posts.filter((p) => p.photo);

  return (
    <div className={styles.pageContainer}>
      <h1>📺 Vidéos & Photos</h1>

      <div className={styles.photoGallery}>
        {videoPosts.length > 0 ? (
          videoPosts.map((post) => (
            <div key={post.id} className={styles.photoItem}>
              {post.photo && (
                <img
                  src={`http://localhost:5000${post.photo}`}
                  alt="Post media"
                  className={styles.photoImage}
                />
              )}
              <div className={styles.photoOverlay}>
                <p>{post.content}</p>
                <small>Par {post.name}</small>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyState}>Aucune vidéo ou photo pour le moment</p>
        )}
      </div>
    </div>
  );
}
