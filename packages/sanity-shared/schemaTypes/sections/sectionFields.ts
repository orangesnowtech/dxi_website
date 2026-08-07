import { defineField } from 'sanity';

/**
 * Fields every section shares: the heading block at the top, an optional
 * anchor for "jump to section" buttons, and the background colour.
 *
 * Shared as a helper because twelve section types would otherwise repeat the
 * same five definitions verbatim.
 */
export const sectionHeaderFields = [
  defineField({
    name: 'eyebrow',
    type: 'string',
    title: 'Eyebrow',
    description: 'The small red tag above the heading.',
    placeholder: 'e.g., The four engines',
  }),
  defineField({
    name: 'heading',
    type: 'string',
    title: 'Heading',
    placeholder: "e.g., Find the growth you're missing",
  }),
  defineField({
    name: 'body',
    type: 'text',
    rows: 3,
    title: 'Intro Paragraph',
    description: 'Optional. Sits under the heading.',
  }),
];

export const sectionIdField = defineField({
  name: 'sectionId',
  type: 'string',
  title: 'Section ID',
  description:
    'Optional. Lets a button jump straight to this section — set it here, then use the same word in the button\'s "Section ID".',
  placeholder: 'e.g., tiers',
  validation: (Rule) =>
    Rule.regex(/^[a-z0-9-]+$/, { name: 'lowercase letters, numbers and dashes only' }).error(
      'Use lowercase letters, numbers and dashes only — no spaces.'
    ),
});

export const backgroundField = defineField({
  name: 'background',
  type: 'string',
  title: 'Background',
  description: 'Alternate between white and grey down the page so sections stay distinct.',
  options: {
    list: [
      { title: 'White', value: 'paper' },
      { title: 'Grey', value: 'ash' },
      { title: 'Black', value: 'dark' },
    ],
    layout: 'radio',
  },
  initialValue: 'paper',
});
