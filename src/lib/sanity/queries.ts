import { client } from '@sanity-shared/lib/client';
import { createClient } from 'next-sanity';

// Import env values directly
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-02';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// Create a non-CDN client for fresh data (bypasses cache)
// Only create if we have the required env vars
const freshClient = projectId && dataset ? createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN to get fresh data
}) : null;

// Query to get all clients
export const clientsQuery = `*[_type == "client"] | order(_createdAt desc) {
  _id,
  title,
  name,
  slug,
  backgroundImage,
  logo,
  "slug": slug.current
}`;

// Query to get a single client by slug
// This query gets products from both:
// 1. The client's products array (if populated)
// 2. Projects that reference this client via the client field
export const clientBySlugQuery = `*[_type == "client" && slug.current == $slug][0] {
  _id,
  title,
  name,
  tagline,
  experienceTag,
  heroImage,
  backgroundImage,
  logo,
  brief,
  services,
  results,
  "slug": slug.current,
  // Get all projects that reference this client (via client field)
  // This works even if the project wasn't added to the client's products array
  "products": *[_type == "project" && client._ref == ^._id]{
    _id,
    title,
    slug,
    image,
    "slug": slug.current
  }
}`;

// Query to get all projects for a client
export const projectsByClientQuery = `*[_type == "project" && references($clientId)] | order(_createdAt desc) {
  _id,
  title,
  slug,
  image,
  content,
  "slug": slug.current
}`;

// Query to get a single project by slug
export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  image,
  heroImage,
  subtitle,
  achievements,
  about,
  imageSections[]{
    layout,
    images[]{
      image,
      caption
    }
  },
  challengesText,
  focusText,
  results,
  "slug": slug.current,
  client->{
    _id,
    title,
    name,
    "slug": slug.current
  }
}`;

// Helper function to fetch clients
export async function getClients() {
  try {
    const clients = await client.fetch(clientsQuery);
    return clients || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

// Helper function to fetch a client by slug
export async function getClientBySlug(slug: string) {
  try {
    return await client.fetch(clientBySlugQuery, { slug });
  } catch (error) {
    console.error('Error fetching client by slug:', error);
    return null;
  }
}

// Helper function to fetch projects by client
export async function getProjectsByClient(clientId: string) {
  return await client.fetch(projectsByClientQuery, { clientId });
}

// Helper function to fetch a project by slug
export async function getProjectBySlug(slug: string) {
  return await client.fetch(projectBySlugQuery, { slug });
}

// Query to get all concepts
export const conceptsQuery = `*[_type == "concept"] | order(_createdAt desc) {
  _id,
  title,
  image,
  team,
  reactionCounts,
  "slug": slug.current,
  tags[]->{
    _id,
    title,
    "slug": slug.current
  }
}`;

// Query to get all tags
export const tagsQuery = `*[_type == "tag"] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;

// Helper function to fetch concepts
export async function getConcepts() {
  try {
    const concepts = await client.fetch(conceptsQuery);
    return concepts || [];
  } catch (error) {
    console.error('Error fetching concepts:', error);
    return [];
  }
}

// Query to get a single concept by slug
export const conceptBySlugQuery = `*[_type == "concept" && slug.current == $slug][0] {
  _id,
  title,
  image,
  team,
  monthYear,
  brandImage,
  brandName,
  about,
  twoImages,
  description1,
  threeImages,
  description2,
  galleryImages,
  results,
  reactionCounts,
  "slug": slug.current,
  tags[]->{
    _id,
    title,
    "slug": slug.current
  }
}`;

// Helper function to fetch a concept by slug
export async function getConceptBySlug(slug: string) {
  try {
    return await client.fetch(conceptBySlugQuery, { slug });
  } catch (error) {
    console.error('Error fetching concept by slug:', error);
    return null;
  }
}

// Helper function to fetch all tags
export async function getTags() {
  try {
    const tags = await client.fetch(tagsQuery);
    return tags || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Query to get all projects with client information
export const allProjectsQuery = `*[_type == "project"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  image,
  "slug": slug.current,
  client->{
    _id,
    title,
    name,
    "slug": slug.current
  }
}`;

// Helper function to fetch all projects
export async function getAllProjects() {
  try {
    const projects = await client.fetch(allProjectsQuery);
    return projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Query to get all insight categories
export const insightCategoriesQuery = `*[_type == "insightCategory"] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;

// Query to get all insights
export const insightsQuery = `*[_type == "insight"] | order(publishedDate desc) {
  _id,
  title,
  featuredImage,
  author,
  readingTime,
  publishedDate,
  "slug": slug.current,
  categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`;

// Query to get a single insight by slug
export const insightBySlugQuery = `*[_type == "insight" && slug.current == $slug][0] {
  _id,
  title,
  featuredImage,
  headerImage,
  author,
  readingTime,
  publishedDate,
  "slug": slug.current,
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  content[]{
    _type,
    heading,
    paragraphs[],
    layout,
    // New media structure (images or videos)
    media[]{
      mediaType,
      image,
      videoFile{
        asset->{
          _id,
          url,
          mimeType
        }
      },
      videoUrl,
      thumbnail,
      caption,
      subtext
    },
    // Legacy images structure (for backward compatibility)
    images[]{
      image,
      caption,
      subtext
    }
  }
}`;

// Helper function to fetch all insight categories
export async function getInsightCategories() {
  try {
    const categories = await client.fetch(insightCategoriesQuery);
    return categories || [];
  } catch (error) {
    console.error('Error fetching insight categories:', error);
    return [];
  }
}

// Helper function to fetch all insights
export async function getInsights() {
  try {
    const insights = await client.fetch(insightsQuery);
    return insights || [];
  } catch (error) {
    console.error('Error fetching insights:', error);
    return [];
  }
}

// Helper function to fetch an insight by slug
export async function getInsightBySlug(slug: string) {
  try {
    return await client.fetch(insightBySlugQuery, { slug });
  } catch (error) {
    console.error('Error fetching insight by slug:', error);
    return null;
  }
}

export const whoWeAreQuery = `*[_type == "whoWeAreSection"][0]{
  label,
  heading,
  buttonText,
  buttonLink
}`;

export async function getWhoWeAre() {
  try {
    // Use freshClient (no CDN) if available, otherwise use regular client
    // freshClient bypasses CDN cache to get latest published data
    const clientToUse = freshClient || client;
    const data = await clientToUse.fetch(whoWeAreQuery);
    // Return null if no data or if it's an empty object
    if (!data) {
      return null;
    }
    // Check if we have at least one meaningful field
    // If all fields are empty/undefined, treat it as no data
    if (!data.label && !data.heading && !data.buttonText && !data.buttonLink) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching Who We Are data:', error);
    return null;
  }
}

export const servicesSectionQuery = `*[_type == "servicesSection"][0]{
  services[] | order(order asc) {
    title,
    description,
    backgroundColor,
    iconName,
    order
  }
}`;

export async function getServicesSection() {
  return await client.fetch(servicesSectionQuery);
}

export const testimonialsSectionQuery = `*[_type == "testimonialsSection"][0]{
  label,
  backgroundImage,
  testimonials[] | order(order asc) {
    quote,
    designation,
    name,
    company,
    order
  }
}`;

export async function getTestimonialsSection() {
  return await client.fetch(testimonialsSectionQuery);
}

export async function getFooterSettings() {
  return client.fetch(`
    *[_type == "footerSettings"][0]{
      address,
      phones,
      email,
      socialLinks
    }
  `);
}

export const conceptPageSettingsQuery = `*[_type == "conceptPageSettings"][0]{
  aboutParagraph
}`;

export async function getConceptPageSettings() {
  return await client.fetch(conceptPageSettingsQuery);
}

export const homepageSettingsQuery = `*[_type == "homepageSettings"][0]{
  heroImage,
  heading1,
  heading2,
  buttonText,
  buttonLink
}`;

export async function getHomepageSettings() {
  try {
    return await client.fetch(homepageSettingsQuery);
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
    return null;
  }
}

