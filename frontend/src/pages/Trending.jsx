import styles from "./Pages.module.css";

export default function Trending({ posts }) {
  // Trier par likes et shares
  const sortedPosts = [...(posts || [])].sort((a, b) => {
    const scoreA = (a.likes || 0) + (a.shares || 0) * 2;
    const scoreB = (b.likes || 0) + (b.shares || 0) * 2;
    return scoreB - scoreA;
  });

  return (
    <div className={styles.pageContainer}>
      <h1>🔥 Tendances</h1>

      <div className={styles.trendingList}>
        {sortedPosts.length > 0 ? (
          sortedPosts.slice(0, 10).map((post, idx) => (
            <div key={post.id} className={styles.trendingItem}>
              <div className={styles.trendingRank}>#{idx + 1}</div>
              <div className={styles.trendingContent}>
                <h3>{post.name}</h3>
                <p>{post.content.substring(0, 100)}...</p>
                <div className={styles.trendingStats}>
                  <span>❤️ {post.likes || 0} likes</span>
                  <span>📤 {post.shares || 0} partages</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyState}>Aucun post tendance pour le moment</p>
        )}
      </div>
    </div>
  );
}
