# Quick Start Guide - Sanity Setup

You've already completed steps 1-2! Now follow these steps:

## ✅ What You've Done
- Created Sanity project "DXI"
- Added Project ID and Dataset to `.env.local`

## 📋 Next Steps

### Step 3: Install Sanity CLI (if needed)
```bash
npm install -g @sanity/cli
```

### Step 4: Initialize Sanity Studio
```bash
sanity init
```
- Choose "Use existing project"
- Select "DXI" project
- Choose dataset (usually "production")
- Choose output path: `sanity` (or `studio`)
- Choose template: "Clean project with no predefined schemas"

### Step 5: Copy Schema Files
1. Copy `sanity-schemas/project.js` to `sanity/schemas/project.js`
2. Copy `sanity-schemas/product.js` to `sanity/schemas/product.js`

### Step 6: Update Sanity Config
Edit `sanity/sanity.config.js` (or `.ts`):

```javascript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import projectSchema from './schemas/project'
import productSchema from './schemas/product'

export default defineConfig({
  name: 'default',
  title: 'DXI Marketing',
  projectId: 'YOUR_PROJECT_ID', // From .env.local
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: [projectSchema, productSchema],
  },
})
```

### Step 7: Start Sanity Studio
```bash
cd sanity
sanity dev
```
Visit `http://localhost:3333`

### Step 8: Create Your First Project
In Sanity Studio:
1. Click "Create new" → "Project"
2. Fill in all fields (see SANITY_SETUP_GUIDE.md for details)
3. Click "Publish"

### Step 9: Create Products
1. Click "Create new" → "Product"
2. Fill in fields and link to your project
3. Click "Publish"
4. Go back to Project and add products to "Products/Showcase Items"

### Step 10: Test
1. Make sure Next.js is running: `npm run dev`
2. Visit `http://localhost:3000/projects`
3. Click on your project to see the detail page

## 📁 Files Created
- `sanity-schemas/project.js` - Project schema
- `sanity-schemas/product.js` - Product schema
- `SANITY_SETUP_GUIDE.md` - Detailed setup guide
- `src/app/projects/[slug]/page.tsx` - Updated project detail page

## 🎨 Layout Matches Screenshot
The project detail page now includes:
- ✅ Hero section with title, tagline, experience tag, and hero image
- ✅ "What we handle" section with services list
- ✅ Brief section with red icon
- ✅ Showcase section with product grid (12 cards)
- ✅ Results section with metrics
- ✅ Dark theme matching your design

## Need Help?
See `SANITY_SETUP_GUIDE.md` for detailed instructions and troubleshooting.

