import { useState } from "react";
import styles from "./Auth.module.css";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validation Login
        if (!formData.email || !formData.password) {
          setError("Tous les champs sont requis");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        if (data.success) {
          onLogin(data.user, data.token);
        } else {
          setError(data.message);
        }
      } else {
        // Validation Signup
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError("Tous les champs sont requis");
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        if (data.success) {
          onLogin(data.user, data.token);
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.logo}>📱 SocialApp</h1>
          <p className={styles.tagline}>
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Nom complet</label>
              <input
                type="text"
                name="name"
                placeholder="Votre nom complet"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Au moins 6 caractères"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
          </button>
        </form>

        <div className={styles.toggle}>
          <p>
            {isLogin ? "Pas encore de compte ? " : "Vous avez déjà un compte ? "}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
              }}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        <div className={styles.demo} style={{ display: "none" }}>
          <p>Demo: bob@email.com / password123</p>
        </div>
      </div>

      <div className={styles.background}></div>
    </div>
  );
}
