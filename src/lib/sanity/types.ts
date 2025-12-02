import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface Project {
  _id: string;
  title: string;
  slug: string;
  backgroundImage: SanityImageSource;
  logo: SanityImageSource;
  description?: string;
  content?: any;
  products?: Product[];
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  image: SanityImageSource;
  description?: string;
  content?: any;
  project?: {
    _id: string;
    title: string;
    slug: string;
  };
}

