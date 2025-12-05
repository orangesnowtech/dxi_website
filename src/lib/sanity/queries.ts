import { client } from '@/sanity/lib/client';

// Query to get all clients
export const clientsQuery = `*[_type == "client"] | order(_createdAt desc) {
  _id,
  title,
  name,
  slug,
  backgroundImage,
  logo,
  description,
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
    description,
    "slug": slug.current
  }
}`;

// Query to get all projects for a client
export const projectsByClientQuery = `*[_type == "project" && references($clientId)] | order(_createdAt desc) {
  _id,
  title,
  slug,
  image,
  description,
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
  brandIdentityImage,
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
  "slug": slug.current
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

// Query to get all projects with client information
export const allProjectsQuery = `*[_type == "project"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  image,
  description,
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

