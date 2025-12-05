# Fix: "Cannot create a published document" Error

## Problem
When creating a project in Sanity Studio, you get the error: "Cannot create a published document. Choose a destination for this document:" and cannot publish.

## Cause
This happens when **Content Releases** is enabled in your Sanity project. Content Releases requires documents to be added to a release before they can be published.

## Solution 1: Disable Content Releases (Recommended)

1. Go to your Sanity project dashboard: https://www.sanity.io/manage
2. Select your project (DXI)
3. Go to **Settings** → **API** → **Content Releases**
4. Disable Content Releases
5. Refresh your Studio and try creating a project again

## Solution 2: Use Content Releases (Alternative)

If you want to keep Content Releases enabled:

1. In Sanity Studio, click the **calendar icon** in the top right corner
2. Create a new release or select an existing one
3. When creating a project, you'll be prompted to add it to a release
4. Add the document to the release
5. Publish the release to publish all documents in it

## Quick Fix via Sanity Dashboard

1. Visit: https://www.sanity.io/manage
2. Select your project
3. Navigate to: **Settings** → **API** → **Content Releases**
4. Toggle Content Releases **OFF**
5. Save changes
6. Refresh your Studio at `/studio`

After disabling Content Releases, you'll be able to create and publish documents directly without needing to add them to a release first.

