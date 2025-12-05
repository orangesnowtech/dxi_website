import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/writeClient';

/**
 * API Route to delete all old "product" type documents from Sanity
 * These are orphaned documents from before the schema rename
 * 
 * GET /api/cleanup-old-products - Lists all old products
 * DELETE /api/cleanup-old-products - Deletes all old products
 */
export async function GET() {
  try {
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'SANITY_API_WRITE_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Fetch all documents of type "product"
    const oldProducts = await writeClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        "slug": slug.current
      }
    `);

    // Also check for references
    const productIds = oldProducts.map((p: any) => p._id);
    
    // Fetch all clients and filter manually for better reliability
    const allClientsForCheck = productIds.length > 0 ? await writeClient.fetch(`
      *[_type == "client"] {
        _id,
        title,
        products
      }
    `) : [];
    
    const clientsWithReferences = allClientsForCheck.filter((client: any) => {
      if (!client.products || !Array.isArray(client.products)) return false;
      return client.products.some((ref: any) => {
        const refId = ref._ref || ref;
        return productIds.includes(refId);
      });
    });

    return NextResponse.json({
      count: oldProducts.length,
      products: oldProducts,
      references: clientsWithReferences.map((c: any) => ({
        clientId: c._id,
        clientTitle: c.title || 'Untitled',
        referencedProductCount: (c.products || []).filter((ref: any) => productIds.includes(ref._ref)).length,
      })),
      message: oldProducts.length === 0 
        ? 'No old "product" documents found.' 
        : `Found ${oldProducts.length} old "product" document(s)${clientsWithReferences.length > 0 ? ` with ${clientsWithReferences.length} client reference(s) that will be removed` : ''}. Use DELETE method to remove them.`,
    });
  } catch (error: any) {
    console.error('Error fetching old products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch old products' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'SANITY_API_WRITE_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Fetch all documents of type "product"
    const oldProducts = await writeClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        "slug": slug.current
      }
    `);

    if (oldProducts.length === 0) {
      return NextResponse.json({
        message: 'No old "product" documents found. Nothing to clean up.',
        deleted: 0,
      });
    }

    const productIds = oldProducts.map(p => p._id);
    const results = [];
    const referenceRemovalResults = [];

    // Step 1: Find ALL documents that reference any of the old products
    // Use Sanity's references() function to find all documents with any reference field
    const allDocumentsWithReferences = await writeClient.fetch(`
      *[references($productIds)] {
        _id,
        _type,
        title,
        name,
        products,
        project
      }
    `, { productIds });
    
    console.log('Documents referencing products:', allDocumentsWithReferences.map((d: any) => ({
      id: d._id,
      type: d._type,
      title: d.title || d.name,
    })));

    // Step 2: Remove references from each document that has them
    const allClients = await writeClient.fetch(`
      *[_type == "client"] {
        _id,
        title,
        products
      }
    `);
    
    const clientsWithReferences = allClients.filter((client: any) => {
      if (!client.products || !Array.isArray(client.products)) return false;
      return client.products.some((ref: any) => {
        const refId = ref._ref || ref;
        return productIds.includes(refId);
      });
    });

    // Remove references from each client
    for (const client of clientsWithReferences) {
      try {
        const originalProducts = client.products || [];
        const remainingProducts = originalProducts.filter((ref: any) => {
          const refId = ref._ref || ref;
          return !productIds.includes(refId);
        });

        const removedCount = originalProducts.length - remainingProducts.length;

        if (removedCount > 0) {
          await writeClient
            .patch(client._id)
            .set({ products: remainingProducts })
            .commit();

          referenceRemovalResults.push({
            success: true,
            clientId: client._id,
            clientTitle: client.title || client._id,
            removedCount,
          });
        }
      } catch (error: any) {
        referenceRemovalResults.push({
          success: false,
          clientId: client._id,
          clientTitle: client.title || client._id,
          error: error.message || String(error),
        });
      }
    }

    // Step 3: Handle any other documents that reference the products
    // Remove references from any other document types
    for (const doc of allDocumentsWithReferences) {
      try {
        // Skip if we already handled this as a client
        if (doc._type === 'client' && clientsWithReferences.some((c: any) => c._id === doc._id)) {
          continue;
        }

        // Get full document to see all fields
        const fullDoc = await writeClient.fetch(`*[_id == $id][0]`, { id: doc._id });
        const patch = writeClient.patch(doc._id);
        let hasChanges = false;

        // Check products array field
        if (fullDoc.products && Array.isArray(fullDoc.products)) {
          const remainingProducts = fullDoc.products.filter((ref: any) => {
            const refId = ref._ref || ref;
            return !productIds.includes(refId);
          });
          if (remainingProducts.length !== fullDoc.products.length) {
            patch.set({ products: remainingProducts });
            hasChanges = true;
          }
        }

        // Check project field (single reference)
        if (fullDoc.project) {
          const refId = fullDoc.project._ref || (typeof fullDoc.project === 'string' ? fullDoc.project : null);
          if (refId && productIds.includes(refId)) {
            patch.unset(['project']);
            hasChanges = true;
          }
        }

        // Check any other possible reference fields
        // Try to find any field that might contain a reference
        for (const [key, value] of Object.entries(fullDoc)) {
          if (key.startsWith('_')) continue; // Skip metadata fields
          
          if (value && typeof value === 'object') {
            // Check if it's a reference object
            if (value._ref && productIds.includes(value._ref)) {
              patch.unset([key]);
              hasChanges = true;
            }
            // Check if it's an array of references
            if (Array.isArray(value)) {
              const filtered = value.filter((item: any) => {
                const refId = item?._ref || item;
                return !productIds.includes(refId);
              });
              if (filtered.length !== value.length) {
                patch.set({ [key]: filtered });
                hasChanges = true;
              }
            }
          }
        }

        if (hasChanges) {
          await patch.commit();
          referenceRemovalResults.push({
            success: true,
            clientId: doc._id,
            clientTitle: doc.title || doc.name || doc._id,
            docType: doc._type,
            removedCount: 1,
          });
        }
      } catch (error: any) {
        referenceRemovalResults.push({
          success: false,
          clientId: doc._id,
          clientTitle: doc.title || doc.name || doc._id,
          docType: doc._type,
          error: error.message || String(error),
        });
      }
    }

    // Step 4: Also unset any references FROM the product documents themselves
    // (old products might have a "project" field pointing to clients)
    for (const product of oldProducts) {
      try {
        await writeClient
          .patch(product._id)
          .unset(['project', 'client'])
          .commit();
      } catch (e) {
        // Ignore if field doesn't exist
      }
    }

    // Step 5: Now delete the old product documents
    for (const doc of oldProducts) {
      try {
        await writeClient.delete(doc._id);
        results.push({ success: true, id: doc._id, title: doc.title || doc._id });
      } catch (error: any) {
        const errorMessage = error.message || error.toString() || 'Unknown error';
        results.push({ 
          success: false, 
          id: doc._id, 
          title: doc.title || doc._id, 
          error: errorMessage 
        });
        console.error(`Failed to delete ${doc._id}:`, errorMessage);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const referencesRemoved = referenceRemovalResults.filter(r => r.success).length;

    return NextResponse.json({
      message: `Cleanup complete. Removed ${referencesRemoved} reference(s), deleted ${successCount} document(s).${failCount > 0 ? ` ${failCount} failed.` : ''}`,
      deleted: successCount,
      failed: failCount,
      referencesRemoved,
      results,
      referenceRemovalResults,
    });
  } catch (error: any) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup old products' },
      { status: 500 }
    );
  }
}

