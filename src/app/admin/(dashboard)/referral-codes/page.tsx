import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import ReferralCodes from "./ReferralCodes";

export const dynamic = "force-dynamic";

export default async function ReferralCodesPage() {
  const session = await getAdminSession();

  // The layout already gates this, but a page that hands out discounts should
  // not rely on a parent to have done so.
  if (!session) {
    redirect("/admin/login");
  }

  return <ReferralCodes isSuperAdmin={session.isSuperAdmin} />;
}
