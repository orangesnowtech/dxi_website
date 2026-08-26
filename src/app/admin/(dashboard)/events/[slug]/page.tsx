import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getEvent } from "@/lib/firebase/events";
import EventRegistrations from "./EventRegistrations";

export const dynamic = "force-dynamic";

export default async function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  return <EventRegistrations event={event} />;
}
