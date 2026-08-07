import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * A grid of plates — the signature card. Used for the four engines on the home
 * page, the three Sales Engine tiers, the Content departments, and the Viral
 * campaign packages.
 */
export default defineType({
  name: 'plateGrid',
  title: 'Plate Grid',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'columns',
      type: 'number',
      title: 'Plates Per Row',
      options: {
        list: [
          { title: 'Two', value: 2 },
          { title: 'Three', value: 3 },
        ],
        layout: 'radio',
      },
      initialValue: 3,
    }),
    defineField({
      name: 'plates',
      type: 'array',
      title: 'Plates',
      of: [{ type: 'plate' }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'band',
      type: 'band',
      title: 'Closing Strip',
      description: 'Optional black strip below the plates.',
      options: { collapsible: true, collapsed: true },
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading', plates: 'plates', eyebrow: 'eyebrow' },
    prepare({ title, plates, eyebrow }) {
      const count = Array.isArray(plates) ? plates.length : 0;
      return {
        title: title || eyebrow || 'Plate grid',
        subtitle: `Plate grid • ${count} plate${count === 1 ? '' : 's'}`,
      };
    },
  },
});
