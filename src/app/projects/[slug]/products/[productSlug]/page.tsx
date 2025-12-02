import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../../components/Nav';
import Footer from '../../../../components/Footer';
import { getProductBySlug, getProductsByProject } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';

// Generate static params for all products
export async function generateStaticParams() {
  // This would need to fetch all products across all projects
  // For now, we'll generate them dynamically
  return [];
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string; productSlug: string };
}) {
  const product = await getProductBySlug(params.productSlug);

  if (!product) {
    notFound();
  }

  const productImageUrl = product.image
    ? urlFor(product.image).width(1200).height(800).url()
    : null;

  return (
    <main className="min-h-screen font-sans">
      <Nav isSticky={false} />

      {/* Hero Section */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          {product.title}
        </h1>
      </section>

      {/* Product Details */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {productImageUrl && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
              <Image
                src={productImageUrl}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {product.description && (
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {/* Content from Sanity */}
          {product.content && (
            <div className="prose prose-lg max-w-none mb-8">
              {/* You can use @portabletext/react to render rich text content */}
              <div className="text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(product.content, null, 2)}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            {product.project && (
              <Link
                href={`/projects/${product.project.slug}`}
                className="text-[#EF1111] underline text-sm"
              >
                ← Back to {product.project.title}
              </Link>
            )}
            <Link
              href="/projects"
              className="text-[#EF1111] underline text-sm"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

