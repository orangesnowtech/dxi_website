"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

type AdminRecord = {
  uid: string;
  email: string;
  isSuperAdmin: boolean;
  disabled: boolean;
  lastSignInAt: string | null;
  createdAt: string | null;
};

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-NG") : "Never";
}

export default function ManageAdmins({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/admins");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load admins");
      }

      setAdmins(data.admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleGrant = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to grant access");
      }

      setNotice(data.message);
      setNewEmail("");
      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (admin: AdminRecord) => {
    const confirmed = window.confirm(
      `Remove admin access from ${admin.email}?\n\nThey will be signed out immediately and will not be able to sign back in.`
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/admins?uid=${admin.uid}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke access");
      }

      setNotice(data.message);
      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Manage Admins</h1>
          <p className={styles.subtitle}>
            Anyone listed here can sign in to the dashboard and review business profile
            submissions. Only you can change this list.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.success}>{notice}</div>}

        <form onSubmit={handleGrant} className={styles.grantForm}>
          <input
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            placeholder="name@dximarketing.com"
            required
            className={styles.grantInput}
          />
          <button type="submit" disabled={busy} className={styles.loginBtn}>
            {busy ? "Working…" : "Grant admin access"}
          </button>
        </form>
        <p className={styles.grantHint}>
          They sign in with Google using this address. If they have never signed in, the
          account is created now and waits for them.
        </p>

        {loading ? (
          <div className={styles.loading}>Loading admins…</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last sign-in</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.uid} className={styles.row}>
                    <td className={styles.name}>
                      {admin.email}
                      {admin.email === currentEmail && " (you)"}
                    </td>
                    <td>{admin.isSuperAdmin ? "Super admin" : "Admin"}</td>
                    <td>{formatDate(admin.lastSignInAt)}</td>
                    <td>{formatDate(admin.createdAt)}</td>
                    <td>
                      {admin.isSuperAdmin ? (
                        <span className={styles.sentNote}>Cannot be removed</span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(admin)}
                          disabled={busy}
                          className={styles.revokeBtn}
                        >
                          Remove access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
