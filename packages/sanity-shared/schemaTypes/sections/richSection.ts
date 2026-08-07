import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * A heading plus free-form paragraphs with links — for copy that does not fit
 * a grid, like the Academy's partner note.
 */
export default defineType({
  name: 'richSection',
  title: 'Text Block',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'content',
      type: 'array',
      title: 'Body',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'Address',
                    validation: (Rule) =>
                      Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
                  }),
                ],
              },
            ],
          },
        },
      ],
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading', eyebrow: 'eyebrow' },
    prepare({ title, eyebrow }) {
      return { title: title || eyebrow || 'Text block', subtitle: 'Text block' };
    },
  },
});
