"use client";

import { getAuthBrowserClient } from "@/lib/authBrowserClient";
import styles from "./Dashboard.module.css";

export function SignOutButton() {
  async function signOut() {
    const client = getAuthBrowserClient();
    await client.signOut();
    window.location.href = "/sign-in";
  }

  return (
    <button type="button" className={styles.editBtn} onClick={() => void signOut()}>
      Sign out
    </button>
  );
}
