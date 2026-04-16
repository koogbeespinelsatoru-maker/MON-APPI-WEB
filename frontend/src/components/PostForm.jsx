import { useState, useRef } from "react";
import styles from "./PostForm.module.css";

export default function PostForm({ onPostCreate, currentUser }) {
  const [content, setContent] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedPhoto) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("userId", currentUser.id);
      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onPostCreate(data.post);
        setContent("");
        handleRemovePhoto();
      }
    } catch (error) {
      console.error("Erreur lors de la création du post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.postForm}>
      <div className={styles.header}>
        {currentUser.profilePhoto ? (
          <img src={currentUser.profilePhoto} alt={currentUser.name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {currentUser.name[0].toUpperCase()}
          </div>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="À quoi pensez-vous?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.input}
          />
          
          {photoPreview && (
            <div className={styles.photoPreview}>
              <img src={photoPreview} alt="Aperçu" />
              <button
                type="button"
                className={styles.removePhotoBtn}
                onClick={handleRemovePhoto}
              >
                ✕
              </button>
            </div>
          )}

          <div className={styles.footer}>
            <div className={styles.icons}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => fileInputRef.current?.click()}
                title="Ajouter une photo"
              >
                📷
              </button>
              <button type="button" className={styles.iconBtn}>😊</button>
              <button type="button" className={styles.iconBtn}>📍</button>
            </div>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={(!content.trim() && !selectedPhoto) || isLoading}
            >
              {isLoading ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        style={{ display: "none" }}
      />
    </div>
  );
}
