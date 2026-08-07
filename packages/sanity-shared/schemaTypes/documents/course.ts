import { defineType, defineField } from 'sanity';

/**
 * An on-demand Academy course. Published courses appear automatically in any
 * "Courses" section on a page.
 */
export default defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Course Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      title: 'Description',
      description: 'What this course covers and who it is for.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'access',
      type: 'string',
      title: 'Who Can Take It',
      options: {
        list: [
          { title: 'Free — open to everyone', value: 'free' },
          { title: 'Members only', value: 'members' },
        ],
        layout: 'radio',
      },
      initialValue: 'members',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'Link',
      description: 'Optional. Where the course lives, if it is hosted elsewhere.',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display Order',
      description: 'Lower numbers appear first.',
      initialValue: 1,
    }),
    defineField({
      name: 'published',
      type: 'boolean',
      title: 'Show On Site',
      description: 'Turn off to keep this course hidden while you write it.',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', access: 'access', order: 'order', published: 'published' },
    prepare({ title, access, order, published }) {
      return {
        title: title || 'Untitled course',
        subtitle: `${access === 'free' ? 'FREE' : 'MEMBERS'} • #${order ?? '?'}${published ? '' : ' • hidden'}`,
      };
    },
  },
});
