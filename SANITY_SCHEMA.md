# Sanity Schema Setup

This document describes the Sanity schema structure needed for the projects and products functionality.

## Required Content Types

### 1. Project (Client)

The project schema includes all fields needed for the project detail page layout. See `sanity-schemas/project.js` for the complete schema file.

**Key Fields:**
- `title` - Project title (e.g., "PurchGadgets")
- `slug` - URL-friendly identifier
- `tagline` - Hero description (e.g., "Purch is a Nigerian platform simplifying secure digital trade.")
- `experienceTag` - Tag shown in hero (e.g., "Full Digital Experience")
- `heroImage` - Main hero image (laptops/desktop view)
- `backgroundImage` - Background for project card on projects page
- `logo` - Client logo
- `services` - Array of services provided
- `brief` - Brief section content
- `results` - Array of results/metrics achieved
- `products` - Array of references to product documents

**Full schema file location:** `sanity-schemas/project.js`

### 2. Product

Create a content type called `product` with the following fields:

```javascript
{
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
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
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
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
```

## Setup Instructions

1. Create a new Sanity project at https://www.sanity.io/
2. Install Sanity CLI: `npm install -g @sanity/cli`
3. Initialize Sanity in your project: `sanity init`
4. Add the schema definitions above to your `schemas` folder
5. Deploy your schema: `sanity deploy`
6. Add your Sanity project ID and dataset to `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

## Notes

- The `products` field in `project` is a reference array to `product` documents
- The `project` field in `product` is a reference back to the parent `project`
- Make sure to create slugs for all documents as they're used for routing
- Images should be uploaded through Sanity Studio for optimal performance

