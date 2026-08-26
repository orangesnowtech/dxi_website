import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import SignOutButton from "./SignOutButton";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

/**
 * The real page-level gate. Middleware only sees whether a cookie exists;
 * this verifies it against Firebase and re-checks the email allowlist.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <>
      <div className={styles.adminBar}>
        <span className={styles.adminBarBrand}>DXI Admin</span>
        <Link href="/admin" className={styles.adminBarLink}>
          Submissions
        </Link>
        <Link href="/admin/referral-codes" className={styles.adminBarLink}>
          Referral codes
        </Link>
        <Link href="/admin/events" className={styles.adminBarLink}>
          Events
        </Link>
        <Link href="/admin/check-in" className={styles.adminBarLink}>
          Check-in
        </Link>
        <Link href="/admin/chats" className={styles.adminBarLink}>
          Chats
        </Link>
        {session.isSuperAdmin && (
          <Link href="/admin/admins" className={styles.adminBarLink}>
            Manage admins
          </Link>
        )}
        <span className={styles.adminBarSpacer} />
        <span className={styles.adminBarEmail}>{session.email}</span>
        <SignOutButton />
      </div>
      {children}
    </>
  );
}
