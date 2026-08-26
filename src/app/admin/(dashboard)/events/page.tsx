import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import EventsManager from "./EventsManager";

export const dynamic = "force-dynamic";

export default async function EventsAdminPage() {
  const session = await getAdminSession();

  // The layout already gates this, but a page that publishes to the live site
  // should not rely on a parent to have done so.
  if (!session) {
    redirect("/admin/login");
  }

  return <EventsManager isSuperAdmin={session.isSuperAdmin} />;
}
