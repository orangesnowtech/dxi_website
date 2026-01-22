# Sanity Connection Setup Guide

This guide explains how to connect your `dxi_website` to your `my-sanity-studio` for both local development and production.

## How It Works

Both your website and Sanity studio connect to the **same Sanity project** using:
- **Project ID**: Your unique Sanity project identifier
- **Dataset**: The dataset name (e.g., "production" or "development")

When you edit content in your Sanity studio, it saves to your Sanity project. Your website reads from the same project, so changes appear automatically.

## Local Development Setup

### Step 1: Create Environment File for Website

Create a file `dxi_website/.env.local` with:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=development
NEXT_PUBLIC_SANITY_API_VERSION=2025-12-02
```

### Step 2: Create Environment File for Sanity Studio

Create a file `my-sanity-studio/.env` with:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=development
SANITY_API_VERSION=2025-12-02
```

**Important**: Both files must use the **SAME** `PROJECT_ID` and `DATASET` values!

### Step 3: Get Your Sanity Project ID

1. Go to https://www.sanity.io/manage
2. Select your project (or create a new one)
3. Copy the Project ID from the project settings
4. Replace `your-project-id` in both `.env` files

### Step 4: Run Both Projects

**Terminal 1 - Sanity Studio:**
```bash
cd my-sanity-studio
npm install
npm run dev
```
Studio will run at: http://localhost:3333

**Terminal 2 - Website:**
```bash
cd dxi_website
npm install
npm run dev
```
Website will run at: http://localhost:3000

## Production Setup

### For Your Website (dxi_website)

Set these environment variables in your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-12-02
```

**Where to set environment variables:**
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Other platforms**: Check their documentation for environment variable setup

### For Your Sanity Studio (my-sanity-studio)

#### Option 1: Deploy to Sanity's Hosting (Recommended)

1. Make sure you have `.env` file with production values:
```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_API_VERSION=2025-12-02
```

2. Deploy the studio:
```bash
cd my-sanity-studio
npm run deploy
```

3. Your studio will be available at: `https://your-project-id.sanity.studio`

#### Option 2: Deploy to Your Own Server

1. Build the studio:
```bash
cd my-sanity-studio
npm run build
```

2. Deploy the `dist` folder to your server (the folder created after build)

3. Set environment variables on your server to match your `.env` file

## Important Notes

1. **Same Project ID**: Both projects MUST use the same `PROJECT_ID`
2. **Same Dataset**: Both projects MUST use the same `DATASET` name
3. **No URL Configuration Needed**: You don't need to specify a Sanity studio URL in your website. Sanity's CDN automatically handles the connection using the Project ID and Dataset.
4. **Environment Variable Names**: 
   - Website uses: `NEXT_PUBLIC_SANITY_*` (with `NEXT_PUBLIC_` prefix)
   - Studio uses: `SANITY_STUDIO_*` (with `SANITY_STUDIO_` prefix)
   - But they reference the **same** project and dataset values

## Troubleshooting

### Website can't connect to Sanity
- Check that `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are set correctly
- Verify the values match your Sanity studio's `.env` file
- Make sure the dataset exists in your Sanity project

### Studio can't connect
- Check that `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` are set correctly
- Run `sanity login` if you haven't authenticated
- Verify you have access to the project

### Changes not appearing on website
- Make sure both are using the same dataset
- Check that you've saved and published content in Sanity studio
- Clear your website's cache or rebuild if using static generation

