import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField } from './sectionFields';

/**
 * Three proof numbers on black. Always dark — the numbers are the point and
 * the red reads hardest against black, so there is no background choice here.
 */
export default defineType({
  name: 'statsSection',
  title: 'Proof Numbers',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'stats',
      type: 'array',
      title: 'Numbers',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            defineField({
              name: 'value',
              type: 'string',
              title: 'The Number',
              description: 'Keep it short — it renders very large.',
              placeholder: 'e.g., ₦81  or  450+  or  48HRS',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              type: 'string',
              title: 'What It Measures',
              placeholder: 'e.g., COST PER QUALIFIED LEAD',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'detail',
              type: 'text',
              rows: 2,
              title: 'Context',
              description: 'The small print that makes the number credible.',
              placeholder: 'e.g., on direct-response campaigns for trusted phone brands',
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
      validation: (Rule) => Rule.max(3).warning('The layout is built for three.'),
    }),
    sectionIdField,
  ],
  preview: {
    select: { title: 'heading', stats: 'stats' },
    prepare({ title, stats }) {
      const count = Array.isArray(stats) ? stats.length : 0;
      return { title: title || 'Proof numbers', subtitle: `Proof numbers • ${count}` };
    },
  },
});
