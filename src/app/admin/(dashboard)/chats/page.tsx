import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { botIsConfigured } from "@/lib/bot/config";
import Chats from "./Chats";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <Chats configured={botIsConfigured()} />;
}
