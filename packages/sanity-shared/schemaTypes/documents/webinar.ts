import { defineType, defineField } from 'sanity';

/**
 * A live Academy session. Upcoming sessions appear automatically in any
 * "Webinars" section, soonest first.
 */
export default defineType({
  name: 'webinar',
  title: 'Webinar',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Session Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      title: 'Description',
      description: 'What this session covers.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startsAt',
      type: 'datetime',
      title: 'Date & Time',
      description: 'West Africa Time. Sessions in the past drop off the site automatically.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'access',
      type: 'string',
      title: 'Who Can Attend',
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
      name: 'registrationUrl',
      type: 'url',
      title: 'Registration Link',
      description: 'Optional. Where people sign up.',
    }),
    defineField({
      name: 'published',
      type: 'boolean',
      title: 'Show On Site',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Soonest first',
      name: 'startsAtAsc',
      by: [{ field: 'startsAt', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', startsAt: 'startsAt', access: 'access', published: 'published' },
    prepare({ title, startsAt, access, published }) {
      const when = startsAt
        ? new Date(startsAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
        : 'No date set';
      return {
        title: title || 'Untitled session',
        subtitle: `${when} • ${access === 'free' ? 'FREE' : 'MEMBERS'}${published ? '' : ' • hidden'}`,
      };
    },
  },
});
