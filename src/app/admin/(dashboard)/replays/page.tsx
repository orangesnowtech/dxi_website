import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import RecordingsManager from "./RecordingsManager";

export const dynamic = "force-dynamic";

export default async function RecordingsPage() {
  const session = await getAdminSession();

  // The layout already gates this, but a page that decides who may watch paid
  // content should not rely on a parent to have done so.
  if (!session) {
    redirect("/admin/login");
  }

  return <RecordingsManager isSuperAdmin={session.isSuperAdmin} />;
}
