"use client";

import { useAuth } from "../../utils/context/AuthContext";
import styles from "../membership.module.css";

export function UserProfile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className={styles.loading}>Loading user profile...</div>;
  }

  if (!user) {
    return null; // This component should only render when user is logged in
  }

  return (
    <div className={styles.userProfile}>
      <h2>Your Profile</h2>

      <div className={styles.profileInfo}>
        <div className={styles.profileField}>
          <label>Name:</label>
          <span>{user.name || "Not provided"}</span>
        </div>

        <div className={styles.profileField}>
          <label>Email:</label>
          <span>{user.email}</span>
        </div>

        <div className={styles.profileField}>
          <label>Member ID:</label>
          <span>{user.id}</span>
        </div>
      </div>

      <div className={styles.membershipStatus}>
        <h3>Membership Status</h3>
        {/* TODO: Add membership status logic */}
        <p>Active Member</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton}>Update Profile</button>
        <button className={styles.actionButton}>Manage Membership</button>
      </div>
    </div>
  );
}
