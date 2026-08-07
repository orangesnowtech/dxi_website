import { defineType } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * A heading and paragraph on their own — no grid beneath. Used on the home
 * page for the "Most agencies improvise. We built a machine." statement.
 */
export default defineType({
  name: 'introSection',
  title: 'Statement',
  type: 'object',
  fields: [...sectionHeaderFields, sectionIdField, backgroundField],
  preview: {
    select: { title: 'heading', eyebrow: 'eyebrow' },
    prepare({ title, eyebrow }) {
      return { title: title || 'Statement', subtitle: eyebrow ? `Statement • ${eyebrow}` : 'Statement' };
    },
  },
});
