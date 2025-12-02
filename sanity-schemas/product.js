export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'Title shown on the product card (e.g., "Website Redesign", "Brand Identity Design")',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description: 'Main image for the product card',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short description of the product',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Full content for product detail page',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image'
        }
      ]
    },
    {
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      description: 'The project this product belongs to',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      project: 'project.title',
    },
    prepare(selection) {
      const { project } = selection;
      return {
        ...selection,
        subtitle: project ? `Project: ${project}` : 'No project',
      };
    },
  },
}

