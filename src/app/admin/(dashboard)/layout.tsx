import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminNav from "./AdminNav";
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
    <div className={styles.adminShell}>
      <AdminNav email={session.email} isSuperAdmin={session.isSuperAdmin} />
      <div className={styles.adminContent}>{children}</div>
    </div>
  );
}
