"use client";

import { useState } from "react";
import { useAuth } from "../../utils/context/AuthContext";
import styles from "../membership.module.css";

export function AuthButtons() {
  const { user, signIn, signUp, signOut, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  if (user) {
    return (
      <div className={styles.userInfo}>
        <h3>Welcome, {user.name || user.email}!</h3>
        <button
          onClick={signOut}
          disabled={isLoading}
          className={styles.authButton}
        >
          {isLoading ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.authSection}>
      <h3>{isSignUp ? "Create Account" : "Sign In"}</h3>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.authInput}
            required={isSignUp}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.authInput}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={styles.authButton}
        >
          {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className={styles.toggleButton}
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Need an account? Sign Up"}
      </button>
    </div>
  );
}
