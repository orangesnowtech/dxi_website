# Troubleshooting "fetch failed" Error

## Issue
Getting "fetch failed" error when visiting `/projects` page.

## Solutions

### 1. Restart Your Dev Server
After adding/changing `.env.local` variables, you **must** restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Verify Environment Variables
Make sure your `.env.local` file has:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=rwlqxxvv
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Check Sanity Studio
1. Visit `http://localhost:3000/studio`
2. Make sure you can access Sanity Studio
3. If Studio loads, your connection is working

### 4. Create Test Project
1. In Sanity Studio, create a test project
2. Fill in at least:
   - Title
   - Slug (auto-generated)
   - Background Image
   - Logo
3. Click "Publish"
4. Then visit `/projects` again

### 5. Check Browser Console
Open browser DevTools (F12) and check:
- Network tab for failed requests
- Console for error messages

### 6. Check Server Logs
Look at your terminal where `npm run dev` is running for error messages.

### 7. Test Sanity Connection
Create a test file to verify connection:

```typescript
// test-sanity.ts (temporary file)
import { client } from './src/sanity/lib/client'

async function test() {
  try {
    const result = await client.fetch('*[_type == "project"]')
    console.log('Success!', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
```

## Common Issues

### Empty Projects Array
If you haven't created any projects yet, the page will show "No projects found" - this is normal!

### CORS Issues
If you see CORS errors, make sure `http://localhost:3000` is added to your Sanity project's CORS origins in the Sanity dashboard.

### Network Issues
- Check your internet connection
- Verify Sanity project is accessible
- Check if Sanity API is down (rare)

## Still Having Issues?

1. Check that your `.env.local` file is in the **root** of your project (same level as `package.json`)
2. Make sure there are no extra spaces or quotes in the env file
3. Restart your dev server
4. Clear Next.js cache: `rm -rf .next` (then restart)

