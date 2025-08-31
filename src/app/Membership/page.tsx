import { Navbar } from "../Componets/navbar/navbar";
import { AuthButtons } from "./components/AuthButtons";
import { UserProfile } from "./components/UserProfile";
import styles from "./membership.module.css";

export default function Membership() {
  return (
    <>
      <Navbar />
      <div className={styles.membershipContainer}>
        <h1>Membership</h1>

        <div className={styles.membershipContent}>
          {/* Server-side content */}
          <div className={styles.membershipInfo}>
            <h2>Join Our Pickleball Community</h2>
            <p>
              Become a member to access exclusive courts, participate in
              tournaments, and connect with fellow pickleball enthusiasts.
            </p>

            <div className={styles.benefits}>
              <h3>Member Benefits:</h3>
              <ul>
                <li>Priority court reservations</li>
                <li>Exclusive tournament access</li>
                <li>Equipment discounts</li>
                <li>Community events</li>
                <li>Skill development programs</li>
              </ul>
            </div>
          </div>

          {/* Client-side components for interactive features */}
          <div className={styles.authContainer}>
            <AuthButtons />
            <UserProfile />
          </div>
        </div>
      </div>
    </>
  );
}
