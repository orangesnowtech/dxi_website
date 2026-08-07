import { defineType, defineField } from 'sanity';

/**
 * The black strip that closes out a grid — a bold statement plus one button.
 * Always trails a grid in the design, so it is a field on the grid sections
 * rather than a section of its own.
 */
export default defineType({
  name: 'band',
  title: 'Closing Strip',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      type: 'text',
      rows: 2,
      title: 'Statement',
      description: 'Wrap the part you want in red with *asterisks*.',
      placeholder: "e.g., Membership: *₦50,000 / year.* Deliberately affordable.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      type: 'cta',
      title: 'Button',
    }),
  ],
  preview: {
    select: { title: 'text' },
    prepare({ title }) {
      return {
        title: (title || 'Closing strip').replace(/\*/g, ''),
        subtitle: 'Closing strip',
      };
    },
  },
});
