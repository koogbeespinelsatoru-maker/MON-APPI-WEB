import { useState } from "react";
import styles from "./Post.module.css";

export default function Post({ post, onLike, onComment, currentUser, onPostUpdated }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [shares, setShares] = useState(post.shares || 0);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText("");
      setShowCommentForm(false);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await response.json();
      if (data.success) {
        setShares(data.post.shares || 0);
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      console.error("Erreur partage:", err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
  };

  const authorName = post.name || post.author;

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          {post.profilePhoto ? (
            <img src={`http://localhost:5000${post.profilePhoto}`} alt={authorName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {authorName[0].toUpperCase()}
            </div>
          )}
          <div>
            <h3 className={styles.author}>{authorName}</h3>
            <span className={styles.time}>{formatTime(post.timestamp)}</span>
          </div>
        </div>
        <button className={styles.moreBtn}>⋯</button>
      </div>

      <div className={styles.content}>
        <p>{post.content}</p>
        {post.photo && (
          <img src={`http://localhost:5000${post.photo}`} alt="Post" className={styles.postPhoto} />
        )}
      </div>

      <div className={styles.stats}>
        <span>👍 {post.likes} personne{post.likes > 1 ? "s" : ""}</span>
        <span>📤 {shares} partage{shares > 1 ? "s" : ""}</span>
        <span>{post.comments.length} commentaire{post.comments.length > 1 ? "s" : ""}</span>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn}`}
          onClick={() => onLike(post.id)}
        >
          👍 J'aime
        </button>
        <button className={styles.actionBtn} onClick={() => setShowCommentForm(!showCommentForm)}>
          💬 Commenter
        </button>
        <button className={styles.actionBtn} onClick={handleShare}>
          📤 Partager
        </button>
      </div>

      {post.comments.length > 0 && (
        <div className={styles.comments}>
          {post.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <strong>{comment.name}</strong>
                <small>{formatTime(comment.timestamp)}</small>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      {showCommentForm && (
        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
          {currentUser.profilePhoto ? (
            <img src={`http://localhost:5000${currentUser.profilePhoto}`} alt={currentUser.name} className={styles.commentAvatar} />
          ) : (
            <div className={styles.commentAvatarPlaceholder}>
              {currentUser.name[0].toUpperCase()}
            </div>
          )}
          <input
            type="text"
            placeholder="Écrivez un commentaire..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />
          <button type="submit">Publier</button>
        </form>
      )}
    </div>
  );
}
