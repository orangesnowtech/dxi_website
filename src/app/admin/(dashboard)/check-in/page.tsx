import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { listEvents } from "@/lib/firebase/events";
import CheckIn from "./CheckIn";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Archived events are excluded: nobody is standing at the door of one.
  const events = (await listEvents()).filter((event) => event.status !== "archived");

  return (
    <CheckIn
      events={events.map((event) => ({
        slug: event.slug,
        title: event.title,
        startsAt: event.startsAt,
      }))}
    />
  );
}
