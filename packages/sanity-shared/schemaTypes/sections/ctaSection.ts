import { defineType, defineField } from 'sanity';
import { sectionIdField } from './sectionFields';

/**
 * The closing black section with the angled red corner. Every page ends on one.
 */
export default defineType({
  name: 'ctaSection',
  title: 'Closing Call To Action',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      placeholder: "e.g., Let's build your growth machine.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 2,
      title: 'Supporting Line',
      placeholder: 'e.g., Start with one engine. Grow into the machine.',
    }),
    defineField({
      name: 'ctas',
      type: 'array',
      title: 'Buttons',
      of: [{ type: 'cta' }],
      validation: (Rule) => Rule.max(2),
    }),
    sectionIdField,
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || 'Closing call to action', subtitle: 'Closing call to action' };
    },
  },
});
