"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export default function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await fetch("/api/admin/session", { method: "DELETE" });

      // Clear the client SDK's own persisted user too, otherwise the login
      // page would silently sign them straight back in.
      const { getFirebaseAuth } = await import("@/lib/firebase/client");
      const { signOut } = await import("firebase/auth");
      await signOut(getFirebaseAuth()).catch(() => {});
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <button onClick={handleSignOut} disabled={signingOut} className={styles.signOutBtn}>
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
