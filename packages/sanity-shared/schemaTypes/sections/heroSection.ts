import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow',
      description: 'The small red tag above the headline.',
      placeholder: 'e.g., Product No. 01 · The revenue driver',
    }),
    defineField({
      name: 'heading',
      type: 'text',
      rows: 2,
      title: 'Headline',
      description:
        'Press Enter to control where the line breaks. A red full stop is added automatically at the end.',
      placeholder: "e.g., Grow like\nit's a system",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sub',
      type: 'text',
      rows: 3,
      title: 'Sub-headline',
      placeholder:
        'e.g., DXI is a Lagos growth agency that finds your customers, talks to them, and closes them.',
    }),
    defineField({
      name: 'ctas',
      type: 'array',
      title: 'Buttons',
      description: 'Up to two. The first should be the action you most want people to take.',
      of: [{ type: 'cta' }],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'tone',
      type: 'string',
      title: 'Background',
      options: {
        list: [
          { title: 'Black', value: 'dark' },
          { title: 'White', value: 'light' },
        ],
        layout: 'radio',
      },
      initialValue: 'dark',
    }),
    defineField({
      name: 'showLowerNotch',
      type: 'boolean',
      title: 'Show Bottom-Left Corner Cut',
      description: 'An extra angled block in the bottom-left. Used on the home page only.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'heading', eyebrow: 'eyebrow', tone: 'tone' },
    prepare({ title, eyebrow, tone }) {
      return {
        title: (title || 'Hero').replace(/\n/g, ' '),
        subtitle: `Hero (${tone === 'light' ? 'white' : 'black'})${eyebrow ? ` • ${eyebrow}` : ''}`,
      };
    },
  },
});
