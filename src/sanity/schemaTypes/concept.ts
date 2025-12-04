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
    // Detail Page Fields
    defineField({
      name: 'monthYear',
      title: 'Month and Year Posted',
      type: 'string',
      description: 'Month and year (e.g., "May 2020")',
    }),
    defineField({
      name: 'brandImage',
      title: 'Brand Image',
      type: 'image',
      description: 'Large brand image after hero section',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'brandName',
      title: 'Brand Name',
      type: 'string',
      description: 'Brand name shown below brand image',
    }),
    defineField({
      name: 'about',
      title: 'About',
      type: 'text',
      description: 'About section content below brand name',
    }),
    defineField({
      name: 'twoImages',
      title: 'Two Images Side by Side',
      type: 'array',
      description: 'Two images displayed side by side',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'description1',
      title: 'First Description',
      type: 'text',
      description: 'Description text after two images',
    }),
    defineField({
      name: 'threeImages',
      title: 'Three Images (Large top, two side by side below)',
      type: 'array',
      description: 'Three images: large on top, two side by side below',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'description2',
      title: 'Second Description (2 Paragraphs)',
      type: 'array',
      description: 'Two paragraphs of text',
      of: [
        {
          type: 'text',
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      description: 'Gallery images in order: large, large, two side by side, large, large',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'results',
      title: 'Results So Far',
      type: 'array',
      description: 'List of results/achievements with red triangular icons',
      of: [
        {
          type: 'string',
        },
      ],
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


