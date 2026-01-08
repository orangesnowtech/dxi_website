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
      placeholder: 'e.g., The Future of Digital Marketing in 2024, How Brand Identity Impacts Consumer Behavior',
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
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'Image displayed on the insight card and header',
      options: {
        hotspot: true,
      },
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
      placeholder: 'e.g., John Doe, Jane Smith',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      description: 'Estimated reading time in minutes',
      placeholder: 'e.g., 5',
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'date',
      description: 'Date when the insight was published',
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
              placeholder: 'e.g., Introduction, Key Findings, Conclusion',
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
                    },
                    {
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                      placeholder: 'e.g., Market analysis chart, User engagement metrics',
                    },
                    {
                      name: 'subtext',
                      title: 'Subtext',
                      type: 'text',
                      description: 'Additional text below caption',
                      placeholder: 'e.g., Data collected from Q1 2024 survey',
                    },
                  ],
                },
              ],
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

