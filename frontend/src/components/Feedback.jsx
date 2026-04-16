import { useState } from "react";
import styles from "./Feedback.module.css";

export default function Feedback({ onClose, currentUser }) {
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      alert("Veuillez écrire votre retour");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          email: email || "anonyme",
          message: feedbackText,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setFeedbackText("");
        setTimeout(() => {
          onClose();
          setSubmitted(false);
        }, 2000);
      } else {
        alert("Erreur lors de l'envoi du retour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>📝 Votre Retour</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {submitted ? (
          <div className={styles.successMessage}>
            <div className={styles.checkmark}>✓</div>
            <h3>Merci pour votre retour!</h3>
            <p>Votre message nous aide à améliorer l'application.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Type de retour *</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className={styles.select}
              >
                <option value="suggestion">💡 Suggestion</option>
                <option value="bug">🐛 Bug</option>
                <option value="compliment">👍 Compliment</option>
                <option value="question">❓ Question</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Email (optionnel)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Votre message *</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Dites-nous ce que vous pensez..."
                className={styles.textarea}
                rows="6"
              />
              <small className={styles.charCount}>
                {feedbackText.length}/500
              </small>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading || !feedbackText.trim()}
            >
              {loading ? "Envoi..." : "📤 Envoyer votre retour"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
