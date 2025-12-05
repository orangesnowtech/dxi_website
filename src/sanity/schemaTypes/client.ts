import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'client',
  title: 'Client',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Client Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Client Name (Hero)',
      type: 'string',
      description: 'Short name shown in green in hero section (e.g., "Purch", "Erisco")',
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
      name: 'tagline',
      title: 'Tagline/Description',
      type: 'string',
      description: 'Short description shown in hero (e.g., "Purch is a Nigerian platform simplifying secure digital trade.")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'experienceTag',
      title: 'Experience Tag',
      type: 'string',
      description: 'Tag shown in hero (e.g., "Full Digital Experience")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main hero image (laptops/desktop view)',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'Background image for client card on clients page',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Client logo',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'services',
      title: 'Services We Handle',
      type: 'array',
      description: 'List of services provided (e.g., Brand Identity & Design, Website Experience)',
      of: [
        {
          type: 'string',
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'brief',
      title: 'Brief',
      type: 'text',
      description: "The brief section content describing the client's needs",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      description: 'List of results/metrics achieved',
      of: [
        {
          type: 'string',
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'products',
      title: 'Projects/Showcase Items',
      type: 'array',
      description: 'Projects or showcase items for this client',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'logo',
    },
  },
})

