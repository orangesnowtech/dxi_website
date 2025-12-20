import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'insight',
  title: 'Insight',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Insight Title',
      type: 'string',
      description: 'Title of the insight article',
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
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'Image displayed on the insight card and header',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headerImage',
      title: 'Header Background Image',
      type: 'image',
      description: 'Background image for the header section on detail page',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Categories for this insight',
      of: [
        {
          type: 'reference',
          to: [{ type: 'insightCategory' }],
        },
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      description: 'Name of the article author',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      description: 'Estimated reading time in minutes',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'date',
      description: 'Date when the insight was published',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Article content sections (text and images)',
      of: [
        {
          type: 'object',
          name: 'textSection',
          title: 'Text Section',
          fields: [
            {
              name: 'heading',
              title: 'Section Heading',
              type: 'string',
            },
            {
              name: 'paragraphs',
              title: 'Paragraphs',
              type: 'array',
              of: [{ type: 'text' }],
            },
          ],
        },
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
                  { title: 'Single Large Image', value: 'single' },
                  { title: 'Two Images Side by Side', value: 'two' },
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
                    },
                    {
                      name: 'subtext',
                      title: 'Subtext',
                      type: 'text',
                      description: 'Additional text below caption',
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
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { author } = selection
      return {
        ...selection,
        subtitle: author ? `By ${author}` : 'No author',
      }
    },
  },
})

