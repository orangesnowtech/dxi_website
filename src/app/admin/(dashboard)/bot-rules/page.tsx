import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import BotRules from "./BotRules";

export const dynamic = "force-dynamic";

export default async function BotRulesPage() {
  const session = await getAdminSession();

  // The layout already gates this, but a page that changes what the assistant
  // tells the public should not rely on a parent to have done so.
  if (!session) {
    redirect("/admin/login");
  }

  return <BotRules />;
}
