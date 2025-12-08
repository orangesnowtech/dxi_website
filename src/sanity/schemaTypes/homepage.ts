import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'whoWeAre',
      title: 'Who We Are Section',
      type: 'object',
      fields: [
        {
          name: 'label',
          title: 'Label',
          type: 'string',
          description: 'Small label text (e.g., "Who We Are")',
          initialValue: 'Who We Are',
        },
        {
          name: 'heading',
          title: 'Heading Text',
          type: 'text',
          description: 'Main heading text. Use {highlight} to wrap text that should be highlighted in orange.',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'buttonText',
          title: 'Button Text',
          type: 'string',
          initialValue: 'Work with Us',
        },
        {
          name: 'buttonLink',
          title: 'Button Link',
          type: 'string',
          initialValue: '/contact-us',
        },
      ],
    }),
    defineField({
      name: 'services',
      title: 'Services Section',
      type: 'object',
      fields: [
        {
          name: 'label',
          title: 'Label',
          type: 'string',
          description: 'Small label text (e.g., "Services We Render")',
          initialValue: 'Services We Render',
        },
        {
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'Our Expertise',
        },
        {
          name: 'services',
          title: 'Services',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Service Title',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'backgroundColor',
                  title: 'Background Color',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'White', value: 'white' },
                      { title: 'Black', value: 'black' },
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'white',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'iconSvg',
                  title: 'Icon SVG',
                  type: 'text',
                  description: 'Paste the SVG code for the icon',
                },
                {
                  name: 'order',
                  title: 'Display Order',
                  type: 'number',
                  description: 'Order in which this service appears (1-6)',
                  validation: (Rule) => Rule.required().min(1).max(6),
                },
              ],
              preview: {
                select: {
                  title: 'title',
                  bgColor: 'backgroundColor',
                  order: 'order',
                },
                prepare({ title, bgColor, order }) {
                  return {
                    title: title || 'Untitled Service',
                    subtitle: `${bgColor} background • Order: ${order || 'N/A'}`,
                  }
                },
              },
            },
          ],
          validation: (Rule) => Rule.max(6),
        },
      ],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials Section',
      type: 'object',
      fields: [
        {
          name: 'label',
          title: 'Label',
          type: 'string',
          initialValue: 'Testimonials',
        },
        {
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'testimonials',
          title: 'Testimonials',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'quote',
                  title: 'Quote/Testimonial Text',
                  type: 'text',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'campaign',
                  title: 'Campaign Name',
                  type: 'string',
                  description: 'Name shown below the quote (e.g., "Social Media Growth Campaign")',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'order',
                  title: 'Display Order',
                  type: 'number',
                  description: 'Order in which this testimonial appears',
                  validation: (Rule) => Rule.required().min(1),
                },
              ],
              preview: {
                select: {
                  campaign: 'campaign',
                  quote: 'quote',
                  order: 'order',
                },
                prepare({ campaign, quote, order }) {
                  return {
                    title: campaign || 'Untitled Campaign',
                    subtitle: `${quote?.substring(0, 50)}... • Order: ${order || 'N/A'}`,
                  }
                },
              },
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Content',
        subtitle: 'Who We Are, Services, and Testimonials',
      }
    },
  },
})

