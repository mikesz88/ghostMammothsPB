import Link from "next/link";
import styles from "./navbar.module.css";

export const Navbar = () => {
  return (
    <div>
      <Link href="/">Home</Link>
      <Link href="/About">About Us</Link>
      <Link href="/Calendar">Calendar</Link>
      <Link href="/Membership">Membership</Link>
    </div>
  );
};
