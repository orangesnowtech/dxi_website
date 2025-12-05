/**
 * Script to delete all old "product" type documents from Sanity
 * These are orphaned documents from before the schema rename
 * 
 * Run with: node scripts/cleanup-old-products.js
 * 
 * Make sure SANITY_API_WRITE_TOKEN is set in your .env.local file
 * 
 * Install dotenv if needed: npm install dotenv
 */

// Try to load .env.local, but continue if dotenv is not installed
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('Note: dotenv not installed. Make sure to set environment variables manually.');
}

const { createClient } = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SANITY_PROJECT_ID:', projectId ? '✓' : '✗');
  console.error('  NEXT_PUBLIC_SANITY_DATASET:', dataset ? '✓' : '✗');
  console.error('  SANITY_API_WRITE_TOKEN:', token ? '✓' : '✗');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  token,
  apiVersion: '2023-05-03',
});

async function cleanupOldProducts() {
  try {
    console.log('Fetching all old "product" type documents...');
    
    // Fetch all documents of type "product"
    const oldProducts = await client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        "slug": slug.current
      }
    `);

    if (oldProducts.length === 0) {
      console.log('✓ No old "product" documents found. Nothing to clean up.');
      return;
    }

    console.log(`\nFound ${oldProducts.length} old "product" document(s):`);
    oldProducts.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.title || 'Untitled'} (ID: ${doc._id}, Slug: ${doc.slug || 'N/A'})`);
    });

    console.log('\n⚠️  WARNING: This will PERMANENTLY DELETE these documents!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    // Wait 5 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Deleting documents...\n');

    // Delete each document
    for (const doc of oldProducts) {
      try {
        await client.delete(doc._id);
        console.log(`✓ Deleted: ${doc.title || doc._id}`);
      } catch (error) {
        console.error(`✗ Failed to delete ${doc.title || doc._id}:`, error.message);
      }
    }

    console.log('\n✓ Cleanup complete!');
    console.log('You can now create new "project" documents in Sanity Studio.');

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupOldProducts();

