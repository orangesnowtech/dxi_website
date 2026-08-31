import { type SchemaTypeDefinition } from 'sanity';

// Documents
import page from './documents/page';
import course from './documents/course';
import webinar from './documents/webinar';
import siteSettings from './documents/siteSettings';
import contactSubmission from './documents/contactSubmission';

// Reusable objects
import cta from './objects/cta';
import plate from './objects/plate';
import band from './objects/band';

// Page sections
import heroSection from './sections/heroSection';
import introSection from './sections/introSection';
import cardGrid from './sections/cardGrid';
import plateGrid from './sections/plateGrid';
import featureList from './sections/featureList';
import statsSection from './sections/statsSection';
import stepsSection from './sections/stepsSection';
import faqSection from './sections/faqSection';
import courseGrid from './sections/courseGrid';
import webinarGrid from './sections/webinarGrid';
import richSection from './sections/richSection';
import ctaSection from './sections/ctaSection';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  page,
  course,
  webinar,
  siteSettings,
  contactSubmission,

  // Objects
  cta,
  plate,
  band,

  // Sections
  heroSection,
  introSection,
  cardGrid,
  plateGrid,
  featureList,
  statsSection,
  stepsSection,
  faqSection,
  courseGrid,
  webinarGrid,
  richSection,
  ctaSection,
];

/** Kept for the studio config, which expects a `{types}` shape. */
export const schema: { types: SchemaTypeDefinition[] } = { types: schemaTypes };
