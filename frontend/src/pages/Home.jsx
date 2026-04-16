import { useState } from "react";
import Post from "../components/Post";
import styles from "./Pages.module.css";

export default function Home({ posts, currentUser, onPostUpdated }) {
  return (
    <div className={styles.pageContainer}>
      <h1>🏠 Accueil</h1>
      <div className={styles.postsList}>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Post 
              key={post.id}
              post={post}
              currentUser={currentUser}
              onPostUpdated={onPostUpdated}
            />
          ))
        ) : (
          <p className={styles.emptyState}>Aucun post pour le moment</p>
        )}
      </div>
    </div>
  );
}
