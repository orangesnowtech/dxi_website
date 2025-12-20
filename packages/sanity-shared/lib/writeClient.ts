import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Client for write operations (mutations) - should not use CDN
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // You'll need to add this to your .env
})

