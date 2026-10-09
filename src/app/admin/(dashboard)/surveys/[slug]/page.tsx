import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getSurvey } from "@/content/surveys";
import SurveyResults from "./SurveyResults";

export const dynamic = "force-dynamic";

export default async function SurveyResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const survey = getSurvey(slug);

  if (!survey) {
    notFound();
  }

  return <SurveyResults survey={survey} />;
}
