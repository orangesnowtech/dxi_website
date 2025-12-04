import { client } from '@/sanity/lib/client';

// Query to get all projects (clients)
export const projectsQuery = `*[_type == "project"] | order(_createdAt desc) {
  _id,
  title,
  name,
  slug,
  backgroundImage,
  logo,
  description,
  "slug": slug.current
}`;

// Query to get a single project by slug
export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
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
  products[]->{
    _id,
    title,
    slug,
    image,
    description,
    "slug": slug.current
  }
}`;

// Query to get all products for a project
export const productsByProjectQuery = `*[_type == "product" && references($projectId)] | order(_createdAt desc) {
  _id,
  title,
  slug,
  image,
  description,
  content,
  "slug": slug.current
}`;

// Query to get a single product by slug
export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
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
  project->{
    _id,
    title,
    name,
    "slug": slug.current
  }
}`;

// Helper function to fetch projects
export async function getProjects() {
  try {
    const projects = await client.fetch(projectsQuery);
    return projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Helper function to fetch a project by slug
export async function getProjectBySlug(slug: string) {
  try {
    return await client.fetch(projectBySlugQuery, { slug });
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
}

// Helper function to fetch products by project
export async function getProductsByProject(projectId: string) {
  return await client.fetch(productsByProjectQuery, { projectId });
}

// Helper function to fetch a product by slug
export async function getProductBySlug(slug: string) {
  return await client.fetch(productBySlugQuery, { slug });
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

