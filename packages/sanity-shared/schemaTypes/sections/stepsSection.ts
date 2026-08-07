import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * A numbered process row — "Five steps. No mystery." on the home page and
 * "From member to machine" on the Academy page.
 */
export default defineType({
  name: 'stepsSection',
  title: 'Process Steps',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'steps',
      type: 'array',
      title: 'Steps',
      description: 'Numbers are added automatically in order — do not type them.',
      of: [
        {
          type: 'object',
          name: 'step',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Step Name',
              placeholder: 'e.g., Blueprint',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              type: 'text',
              rows: 3,
              title: 'What Happens',
              placeholder: 'e.g., Scope, timeline, and targets agreed in writing before anything is built.',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        },
      ],
      validation: (Rule) => Rule.max(5).warning('The row is built for five steps.'),
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading', steps: 'steps' },
    prepare({ title, steps }) {
      const count = Array.isArray(steps) ? steps.length : 0;
      return { title: title || 'Process steps', subtitle: `Process • ${count} step${count === 1 ? '' : 's'}` };
    },
  },
});
