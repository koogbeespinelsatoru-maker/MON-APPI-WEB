import { useState } from "react";
import styles from "./Profile.module.css";

export default function Profile({ currentUser, onClose, onProfileUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}/photo`, {
        method: "PUT",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        onProfileUpdate({ ...currentUser, profilePhoto: data.user.profilePhoto });
        setError("");
      } else {
        setError("Erreur lors de l'upload");
      }
    } catch (err) {
      setError("Erreur lors de l'upload");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.profileOverlay} onClick={onClose}>
      <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Mon Profil</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.photoSection}>
            <div className={styles.photoContainer}>
              {currentUser.profilePhoto ? (
                <img src={`http://localhost:5000${currentUser.profilePhoto}`} alt={currentUser.name} className={styles.photo} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  {currentUser.name[0].toUpperCase()}
                </div>
              )}
              <label className={styles.uploadLabel}>
                📷 Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            {isUploading && <p className={styles.uploading}>Upload en cours...</p>}
          </div>

          <div className={styles.info}>
            <div className={styles.infoGroup}>
              <label>Nom</label>
              <p>{currentUser.name}</p>
            </div>

            <div className={styles.infoGroup}>
              <label>Email</label>
              <p>{currentUser.email}</p>
            </div>

            <div className={styles.infoGroup}>
              <label>ID Utilisateur</label>
              <p>#{currentUser.id}</p>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button onClick={onClose} className={styles.closeDetailsBtn}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
