import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import LinksManager from "./LinksManager";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const session = await getAdminSession();

  // The layout already gates this, but a page that decides where the public
  // gets sent should not rely on a parent to have done so.
  if (!session) {
    redirect("/admin/login");
  }

  return <LinksManager isSuperAdmin={session.isSuperAdmin} />;
}
