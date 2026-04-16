import { useState, useEffect } from "react";
import styles from "./PhotoGallery.module.css";

export default function PhotoGallery({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/photos`
      );
      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error("Erreur chargement photos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className={styles.loading}>Chargement des photos...</p>;
  }

  return (
    <div className={styles.galleryContainer}>
      <h2>📸 Mes Photos</h2>

      {photos.length === 0 ? (
        <p className={styles.emptyState}>
          Aucune photo pour le moment. Publiez une nouvelle publication avec
          une photo!
        </p>
      ) : (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.photoCard}>
              <img
                src={`http://localhost:5000${photo.photo}`}
                alt="Photo"
                className={styles.photo}
              />
              <div className={styles.photoDate}>
                {new Date(photo.timestamp).toLocaleDateString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
