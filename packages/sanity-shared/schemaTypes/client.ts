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
      placeholder: 'e.g., Purch Platform, Erisco Foods',
    }),
    defineField({
      name: 'name',
      title: 'Client Name (Hero)',
      type: 'string',
      description: 'Short name shown in green in hero section',
      placeholder: 'e.g., Purch, Erisco, MTN',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline/Description',
      type: 'string',
      description: 'Short description shown in hero',
      placeholder: 'e.g., Purch is a Nigerian platform simplifying secure digital trade.',
    }),
    defineField({
      name: 'experienceTag',
      title: 'Experience Tag',
      type: 'string',
      description: 'Tag shown in hero',
      placeholder: 'e.g., Full Digital Experience, Brand Transformation',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main hero image (laptops/desktop view)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'Background image for client card on clients page',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Client logo',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'services',
      title: 'Services We Handle',
      type: 'array',
      description: 'List of services provided',
      of: [
        {
          type: 'string',
        },
      ],
      initialValue: ['Brand Identity & Design', 'Website Experience'],
    }),
    defineField({
      name: 'brief',
      title: 'Brief',
      type: 'text',
      description: "The brief section content describing the client's needs",
      placeholder: 'e.g., The client needed a complete brand overhaul to appeal to a younger demographic...',
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
      initialValue: ['200% increase in brand awareness', '150% growth in user engagement'],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'logo',
    },
  },
})

