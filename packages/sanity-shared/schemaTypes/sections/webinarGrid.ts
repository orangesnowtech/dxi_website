import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * Lists upcoming webinars automatically, soonest first. Hidden on the site
 * while there are none, so it can be placed before the content exists.
 */
export default defineType({
  name: 'webinarGrid',
  title: 'Webinars',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'includePast',
      type: 'boolean',
      title: 'Also Show Past Sessions',
      description: 'Off by default — only sessions that have not happened yet are listed.',
      initialValue: false,
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return {
        title: title || 'Webinars',
        subtitle: 'Webinars • pulls in scheduled sessions',
      };
    },
  },
});
