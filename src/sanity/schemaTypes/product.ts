import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'Title shown on the product card (e.g., "Website Redesign", "Product Launch")',
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
      title: 'Product Image',
      type: 'image',
      description: 'Main image for the product card',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    // Hero Section Fields
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Large hero image shown on the right side of hero section',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle/Designer Text',
      type: 'string',
      description: 'Text below product title (e.g., "Design from, Company Name Marketing Team")',
    }),
    // Achievement Section
    defineField({
      name: 'achievements',
      title: 'Achievements',
      type: 'array',
      description: 'List of achievements with red triangular icons',
      of: [
        {
          type: 'string',
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'about',
      title: 'About Project',
      type: 'text',
      description: 'About Project section content (similar to Brief section in projects)',
      validation: (Rule) => Rule.required(),
    }),
    // Images Sections
    defineField({
      name: 'imageSections',
      title: 'Image Sections',
      type: 'array',
      description: 'Multiple image sections (single image or grid of 3)',
      of: [
        {
          type: 'object',
          name: 'imageSection',
          title: 'Image Section',
          fields: [
            {
              name: 'layout',
              title: 'Layout',
              type: 'string',
              options: {
                list: [
                  { title: 'Single Image', value: 'single' },
                  { title: 'Grid of 3', value: 'grid' },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'imageWithCaption',
                  title: 'Image with Caption',
                  fields: [
                    {
                      name: 'image',
                      title: 'Image',
                      type: 'image',
                      options: {
                        hotspot: true,
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                      description: 'Caption text below the image',
                    },
                  ],
                },
              ],
              validation: (Rule) => Rule.required().min(1),
            },
          ],
        },
      ],
    }),
    // Challenges Section
    defineField({
      name: 'challengesText',
      title: 'Challenges Text',
      type: 'text',
      description: 'Paragraph text in the Challenges section',
    }),
    // Focus Section
    defineField({
      name: 'focusText',
      title: 'Focus Text',
      type: 'text',
      description: 'Paragraph text in the Focus section',
    }),
    // Results Section
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      description: 'List of results with red triangular icons',
      of: [
        {
          type: 'string',
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    // Brand Identity Designs Section
    defineField({
      name: 'brandIdentityImage',
      title: 'Brand Identity Designs Image',
      type: 'image',
      description: 'Background image for Brand Identity Designs section',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'The project this product belongs to',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      project: 'project.title',
    },
    prepare(selection) {
      const { project } = selection
      return {
        ...selection,
        subtitle: project ? `Project: ${project}` : 'No project',
      }
    },
  },
})

