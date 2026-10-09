import type { Metadata } from "next";
import { Carlito, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { getSurvey } from "@/content/surveys";
import SurveyForm from "./SurveyForm";

// The client's typefaces, loaded only here so the rest of the site never
// pays for them.
const carlito = Carlito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-carlito",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const survey = getSurvey(slug);

  return {
    // Absolute, so the client's questionnaire is not titled "— DXI Marketing".
    title: { absolute: survey ? `${survey.client} · ${survey.name}` : "Questionnaire" },
    // Reached by a link we hand out, and private to the people it is sent to.
    robots: { index: false, follow: false },
  };
}

export default async function SurveyPage({ params }: Props) {
  const { slug } = await params;
  const survey = getSurvey(slug);

  if (!survey) {
    notFound();
  }

  return (
    <div className={`${carlito.variable} ${newsreader.variable}`}>
      <SurveyForm survey={survey} />
    </div>
  );
}
