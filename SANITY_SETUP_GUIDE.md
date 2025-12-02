# Sanity Schema Setup Guide

This guide will help you set up the Sanity schemas for your DXI website project.

## Prerequisites

- You have created a Sanity project at https://www.sanity.io/
- You have added your Project ID and Dataset to `.env.local`
- You have Sanity CLI installed (or will install it)

## Step 1: Install Sanity CLI (if not already installed)

```bash
npm install -g @sanity/cli
```

## Step 2: Initialize Sanity in Your Project

If you haven't initialized Sanity in your project yet:

```bash
sanity init
```

Follow the prompts:
- Choose "Create new project" or "Use existing project"
- Select your project (DXI)
- Choose dataset (usually "production")
- Choose output path (recommended: `sanity` or `studio`)
- Choose template: "Clean project with no predefined schemas"

## Step 3: Add Schema Files

1. Navigate to your Sanity studio folder (usually `sanity` or `studio`)
2. Go to the `schemas` folder
3. Copy the schema files from `sanity-schemas/` folder in your project root:
   - Copy `project.js` to `schemas/project.js`
   - Copy `product.js` to `schemas/product.js`

## Step 4: Register Schemas

In your Sanity studio folder, find the `sanity.config.js` or `sanity.config.ts` file and update it to include your schemas:

```javascript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import projectSchema from './schemas/project'
import productSchema from './schemas/product'

export default defineConfig({
  name: 'default',
  title: 'DXI Marketing',

  projectId: 'your-project-id', // Replace with your actual project ID
  dataset: 'production', // Or your dataset name

  plugins: [deskTool()],

  schema: {
    types: [
      projectSchema,
      productSchema,
    ],
  },
})
```

## Step 5: Start Sanity Studio

```bash
cd sanity  # or cd studio (depending on your folder name)
sanity dev
```

Or if you're running it from the project root:

```bash
npm run dev
```

Then visit `http://localhost:3333` to access Sanity Studio.

## Step 6: Create Your First Project

1. In Sanity Studio, click "Create new" → "Project"
2. Fill in the required fields:
   - **Title**: e.g., "PurchGadgets"
   - **Slug**: Will auto-generate from title (e.g., "purchgadgets")
   - **Tagline**: e.g., "Purch is a Nigerian platform simplifying secure digital trade."
   - **Experience Tag**: e.g., "Full Digital Experience"
   - **Hero Image**: Upload the hero image (laptops/desktop view)
   - **Background Image**: Upload background for project card
   - **Logo**: Upload client logo
   - **Services**: Add services (one per line):
     - Brand Identity & Design
     - Website Experience
     - Content & Copy
     - Analytics & Insights
   - **Brief**: Add the brief text
   - **Results**: Add results/metrics (one per line):
     - 2x growth in digital engagements within the first six months
     - 60% increase in returning customers through improved UX and loyalty campaigns
     - Consistent brand alignment across all digital touchpoints
   - **Products**: Leave empty for now (you'll add products after creating them)

3. Click "Publish"

## Step 7: Create Products

1. Click "Create new" → "Product"
2. Fill in the fields:
   - **Title**: e.g., "Website Redesign"
   - **Slug**: Auto-generates from title
   - **Product Image**: Upload the product image
   - **Description**: Optional short description
   - **Project**: Select the project this product belongs to
   - **Content**: Optional rich text content for product detail page

3. Click "Publish"

4. Repeat for all products (Website Redesign, Brand Identity Design, Content Creation, Product Launch, etc.)

## Step 8: Link Products to Projects

1. Go back to your Project document
2. Scroll to the "Products/Showcase Items" field
3. Click "Add item" and select the products you created
4. Click "Publish"

## Step 9: Verify

1. Make sure your Next.js dev server is running: `npm run dev`
2. Visit `http://localhost:3000/projects`
3. You should see your project cards
4. Click on a project to see the detail page with all sections

## Troubleshooting

### Schema not showing in Studio
- Make sure you've saved the schema files in the correct location
- Check that the schemas are registered in `sanity.config.js`
- Restart Sanity Studio

### Images not loading
- Verify your `.env.local` has the correct `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- Make sure images are published in Sanity Studio
- Check browser console for errors

### Products not showing
- Make sure products are linked to the project in Sanity Studio
- Verify products are published (not drafts)
- Check that the product references are correct

## Next Steps

- Add more projects following the same structure
- Customize the schema if needed for additional fields
- Set up concepts page with similar structure (when ready)

