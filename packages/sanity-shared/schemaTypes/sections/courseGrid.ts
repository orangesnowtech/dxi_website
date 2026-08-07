import { defineType } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * Lists every published course automatically — add a Course in the studio and
 * it appears here. The whole section is hidden on the site while there are no
 * published courses, so it can be placed on the page before the content exists.
 */
export default defineType({
  name: 'courseGrid',
  title: 'Courses',
  type: 'object',
  fields: [...sectionHeaderFields, sectionIdField, backgroundField],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return {
        title: title || 'Courses',
        subtitle: 'Courses • pulls in every published course',
      };
    },
  },
});
