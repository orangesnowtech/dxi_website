import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { SURVEYS } from "@/content/surveys";
import { surveyPath } from "@/lib/surveys";
import { listSurveyResponses } from "@/lib/firebase/surveys";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const rows = await Promise.all(
    SURVEYS.map(async (survey) => {
      const responses = await listSurveyResponses(survey.slug);
      const submitted = responses.filter((response) => response.status === "submitted").length;

      return { survey, submitted, inProgress: responses.length - submitted };
    })
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Surveys</h1>
          <p className={styles.subtitle}>
            Client questionnaires. Each has one link to share and a summary of what came back.
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Questionnaire</th>
                <th>Client</th>
                <th>Submitted</th>
                <th>In progress</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ survey, submitted, inProgress }) => (
                <tr key={survey.slug} className={styles.row}>
                  <td className={styles.name}>{survey.name}</td>
                  <td>{survey.client}</td>
                  <td>{submitted}</td>
                  <td>{inProgress}</td>
                  <td>{survey.open ? "Open" : "Closed"}</td>
                  <td className={styles.actionCell}>
                    <Link href={`/admin/surveys/${survey.slug}`} className={styles.viewDetailsBtn}>
                      Responses
                    </Link>
                    <Link
                      href={surveyPath(survey.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.navLink}
                    >
                      Form ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
