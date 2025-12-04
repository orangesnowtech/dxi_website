import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'concept',
  title: 'Concept',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Concept Title',
      type: 'string',
      description: 'Title shown on the concept card (e.g., "Brand Identity Design", "Content Creation")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Concept Image',
      type: 'image',
      description: 'Main image for the concept card',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'string',
      description: 'Team name (e.g., "Design Team", "Social Media Team", "Marketing Team")',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      team: 'team',
    },
    prepare(selection) {
      const { team } = selection
      return {
        ...selection,
        subtitle: team ? `Team: ${team}` : 'No team',
      }
    },
  },
})


