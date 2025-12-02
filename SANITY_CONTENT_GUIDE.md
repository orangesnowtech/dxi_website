# How to Add Content in Sanity Studio

This guide will walk you through creating projects and products in Sanity Studio.

## Step 1: Create Your First Project

1. **Open Sanity Studio**: Visit `http://localhost:3000/studio`
2. **Click on "Project"** in the left sidebar
3. **Click "Create new"** button (top right)
4. **Fill in the fields** as described below:

### Required Fields for Project:

#### Basic Information
- **Title**: Enter the project/client name
  - Example: `PurchGadgets` or `Erisco Foods`
  
- **Slug**: This auto-generates from the title
  - Click "Generate" if it doesn't auto-fill
  - Example: `purchgadgets` or `erisco-foods`

#### Hero Section (Top of Project Detail Page)
- **Tagline/Description**: The main description shown in the hero
  - Example: `Purch is a Nigerian platform simplifying secure digital trade.`
  
- **Experience Tag**: The tag shown below the tagline
  - Example: `Full Digital Experience`

- **Hero Image**: Upload the main hero image (laptops/desktop view)
  - Click "Upload" or drag and drop
  - This appears on the right side of the hero section

#### Project Card (Projects List Page)
- **Background Image**: Upload the background image for the project card
  - This is the image shown on `/projects` page
  - Example: A branded background image

- **Logo**: Upload the client logo
  - This appears centered on the background image
  - Should be a transparent PNG or white logo

#### Services Section
- **Services We Handle**: Click "Add item" for each service
  - Add one service per line:
    - `Brand Identity & Design`
    - `Website Experience`
    - `Content & Copy`
    - `Analytics & Insights`
  - You can add as many as needed

#### Brief Section
- **Brief**: Enter the brief text describing the client's needs
  - Example: `Purch needed a strategic partner to build and sustain its digital presence across all fronts — from brand identity and content strategy to online engagement and performance marketing. The goal was to establish credibility, increase user trust, and attract long-term platform users in a highly competitive market.`

#### Results Section
- **Results**: Click "Add item" for each result/metric
  - Add one result per line:
    - `2x growth in digital engagements within the first six months`
    - `60% increase in returning customers through improved UX and loyalty campaigns`
    - `Consistent brand alignment across all digital touchpoints`
  - You can add as many as needed

#### Products (Add Later)
- **Products/Showcase Items**: Leave this empty for now
  - You'll add products after creating them
  - Then come back and link them here

5. **Click "Publish"** (top right) to save your project

---

## Step 2: Create Products

Products are the showcase items that appear in the grid on the project detail page.

1. **Click on "Product"** in the left sidebar
2. **Click "Create new"** button
3. **Fill in the fields**:

### Required Fields for Product:

- **Title**: The product name shown on the card
  - Examples:
    - `Website Redesign`
    - `Brand Identity Design`
    - `Content Creation`
    - `Product Launch`

- **Slug**: Auto-generates from title
  - Click "Generate" if needed

- **Product Image**: Upload the product image
  - This is the main image shown on the product card
  - Should be a high-quality image representing the work

- **Description**: (Optional) Short description
  - Example: `Complete website redesign with modern UI/UX`

- **Project**: **IMPORTANT** - Select the project this product belongs to
  - Click the dropdown and select your project
  - This links the product to the project

- **Content**: (Optional) Rich text content for the product detail page
  - You can add formatted text, images, etc.
  - This appears on the product detail page

4. **Click "Publish"** to save

5. **Repeat** for all products (Website Redesign, Brand Identity, Content Creation, etc.)

---

## Step 3: Link Products to Project

After creating products, link them back to your project:

1. **Go back to your Project** document
2. **Scroll down to "Products/Showcase Items"**
3. **Click "Add item"**
4. **Select a product** from the dropdown
5. **Repeat** to add all products
6. **Click "Publish"** to save

---

## Step 4: View Your Content

1. **Visit** `http://localhost:3000/projects`
   - You should see your project card with background image and logo

2. **Click on the project** to see the full detail page:
   - Hero section with title, tagline, and hero image
   - Services section
   - Brief section
   - Showcase grid with all your products
   - Results section

3. **Click on a product** in the showcase to see the product detail page

---

## Example: Complete PurchGadgets Project

Here's an example of how to fill out a complete project:

### Project Fields:
- **Title**: `PurchGadgets`
- **Slug**: `purchgadgets` (auto-generated)
- **Tagline**: `Purch is a Nigerian platform simplifying secure digital trade.`
- **Experience Tag**: `Full Digital Experience`
- **Hero Image**: Upload image of laptops/desktop
- **Background Image**: Upload PurchGadgets branded background
- **Logo**: Upload PurchGadgets logo
- **Services**:
  1. `Brand Identity & Design`
  2. `Website Experience`
  3. `Content & Copy`
  4. `Analytics & Insights`
- **Brief**: `Purch needed a strategic partner to build and sustain its digital presence across all fronts — from brand identity and content strategy to online engagement and performance marketing. The goal was to establish credibility, increase user trust, and attract long-term platform users in a highly competitive market.`
- **Results**:
  1. `2x growth in digital engagements within the first six months`
  2. `60% increase in returning customers through improved UX and loyalty campaigns`
  3. `Consistent brand alignment across all digital touchpoints`

### Products to Create:
1. **Website Redesign** - Link to PurchGadgets project
2. **Brand Identity Design** - Link to PurchGadgets project
3. **Content Creation** - Link to PurchGadgets project
4. **Product Launch** - Link to PurchGadgets project
(Add more as needed)

---

## Tips

- **Images**: Use high-quality images (recommended: 1200px+ width)
- **Slugs**: Keep them lowercase and URL-friendly (no spaces, use hyphens)
- **Publishing**: Always click "Publish" after making changes
- **Drafts**: Unpublished changes won't appear on your website
- **Order**: Products appear in the order you add them (you can reorder later)

---

## Troubleshooting

### Projects not showing on `/projects` page?
- Make sure the project is **Published** (not a draft)
- Check that Background Image and Logo are uploaded
- Restart your dev server if needed

### Products not showing in showcase?
- Make sure products are **Published**
- Verify products are linked to the project in "Products/Showcase Items"
- Check that Product Image is uploaded

### Images not loading?
- Make sure images are uploaded and published
- Check browser console for errors
- Verify image URLs in Sanity Studio

---

Need help? Check the Sanity documentation or review your schema files in `src/sanity/schemaTypes/`

