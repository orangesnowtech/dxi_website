import type { Survey } from "@/lib/surveys";
import { cfgBrand2030 } from "./cfg-brand-2030";

/** Every questionnaire the site can serve. The slug is the public address. */
export const SURVEYS: readonly Survey[] = [cfgBrand2030];

export function getSurvey(slug: string): Survey | null {
  return SURVEYS.find((survey) => survey.slug === slug) ?? null;
}
