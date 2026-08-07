import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

export default defineType({
  name: 'faqSection',
  title: 'Questions',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'items',
      type: 'array',
      title: 'Questions',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              title: 'Question',
              description: 'Write it the way a customer would actually ask it.',
              placeholder: 'e.g., Do I own the website?',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              type: 'text',
              rows: 5,
              title: 'Answer',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
        },
      ],
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return { title: title || 'Questions', subtitle: `FAQ • ${count} question${count === 1 ? '' : 's'}` };
    },
  },
});
