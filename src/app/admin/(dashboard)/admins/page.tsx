import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import ManageAdmins from "./ManageAdmins";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const session = await getAdminSession();

  // The layout already proved they are an admin; this narrows it to the one
  // account allowed to change who else is.
  if (!session?.isSuperAdmin) {
    redirect("/admin");
  }

  return <ManageAdmins currentEmail={session.email} />;
}
