import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import EmailLog from "./EmailLog";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const session = await getAdminSession();

  // The layout already gates this, but a page that can send mail should not
  // rely on a parent to have done so.
  if (!session) {
    redirect("/admin/login");
  }

  return <EmailLog />;
}
