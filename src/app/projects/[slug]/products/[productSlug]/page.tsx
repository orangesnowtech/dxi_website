import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../../components/Nav';
import Footer from '../../../../components/Footer';
import { getProductBySlug } from '@/lib/sanity/queries';
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
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { productSlug, slug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const heroImageUrl = product.heroImage
    ? urlFor(product.heroImage).width(1200).height(800).url()
    : null;

  return (
    <main className="min-h-screen font-sans bg-black text-white">
      <Nav isSticky={false} />

      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] flex items-center bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              {product.project && (
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#EF1111]">
                  {product.project.title}
                </h1>
              )}
              <h2 className="text-6xl md:text-7xl font-bold mb-4 text-white">
                {product.title}
              </h2>
              {product.subtitle && (
                <p className="text-lg md:text-xl text-white/80 mb-6">
                  {product.subtitle}
                </p>
              )}
              {/* Overview Button */}
              <div className="flex items-center gap-3 mt-6">
                <div className="w-12 h-12 rounded-full bg-[#EF1111] flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 5V19L19 12L8 5Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-white text-lg">Overview</span>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            {heroImageUrl && (
              <div className="relative w-full h-[400px] md:h-[500px]">
                <Image
                  src={heroImageUrl}
                  alt={product.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Achievement Section */}
      {product.achievements && product.achievements.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">
              Achievement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {product.achievements.map((achievement: string, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 5V19L19 12L8 5Z"
                        fill="#EF1111"
                      />
                    </svg>
                  </div>
                  <p className="text-lg text-white/90">{achievement}</p>
                </div>
              ))}
            </div>
            {product.achievementText && (
              <p className="text-lg text-white/80 leading-relaxed max-w-4xl">
                {product.achievementText}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Image Sections */}
      {product.imageSections && product.imageSections.length > 0 && (
        <>
          {product.imageSections.map((section: any, sectionIndex: number) => (
            <section key={sectionIndex} className="bg-black py-16">
              <div className="container mx-auto px-6">
                <div className="flex items-center gap-3 mb-8">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 5V19L19 12L8 5Z"
                      fill="#EF1111"
                    />
                  </svg>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#EF1111]">
                    Images
                  </h3>
                </div>

                {section.layout === 'single' && section.images && section.images[0] && (
                  <div className="mb-6">
                    <div className="relative w-full h-[500px] md:h-[600px] mb-4">
                      <Image
                        src={urlFor(section.images[0].image).width(1200).height(800).url()}
                        alt={section.images[0].caption || 'Image'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    {section.images[0].caption && (
                      <p className="text-white/80 text-lg">{section.images[0].caption}</p>
                    )}
                  </div>
                )}

                {section.layout === 'grid' && section.images && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top two images */}
                    {section.images.slice(0, 2).map((img: any, idx: number) => (
                      <div key={idx} className="mb-6">
                        <div className="relative w-full h-[300px] md:h-[400px] mb-4">
                          <Image
                            src={urlFor(img.image).width(800).height(600).url()}
                            alt={img.caption || 'Image'}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        {img.caption && (
                          <p className="text-white/80">{img.caption}</p>
                        )}
                      </div>
                    ))}
                    {/* Bottom full-width image */}
                    {section.images[2] && (
                      <div className="md:col-span-2 mb-6">
                        <div className="relative w-full h-[400px] md:h-[500px] mb-4">
                          <Image
                            src={urlFor(section.images[2].image).width(1200).height(800).url()}
                            alt={section.images[2].caption || 'Image'}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        {section.images[2].caption && (
                          <p className="text-white/80">{section.images[2].caption}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          ))}
        </>
      )}

      {/* Challenges Section */}
      {product.challengesText && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Challenges
            </h2>
            <p className="text-lg text-white/80 leading-relaxed max-w-4xl">
              {product.challengesText}
            </p>
          </div>
        </section>
      )}

      {/* Focus Section */}
      {product.focusText && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Focus
            </h2>
            <p className="text-lg text-white/80 leading-relaxed max-w-4xl">
              {product.focusText}
            </p>
          </div>
        </section>
      )}

      {/* Results So Far Section */}
      {product.results && product.results.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">
              Results So Far
            </h2>
            <div className="space-y-4">
              {product.results.map((result: string, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 5V19L19 12L8 5Z"
                        fill="#EF1111"
                      />
                    </svg>
                  </div>
                  <p className="text-lg text-white/90">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Identity Designs Section */}
      {product.brandIdentityImage && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Brand Identity Designs
            </h2>
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src={urlFor(product.brandIdentityImage).width(1200).height(800).url()}
                alt="Brand Identity Designs"
                fill
                className="object-cover rounded-lg opacity-50"
              />
            </div>
          </div>
        </section>
      )}

      {/* Back Navigation */}
      <section className="bg-black py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {product.project && (
              <Link
                href={`/projects/${product.project.slug}`}
                className="text-[#EF1111] underline text-sm hover:text-[#FF3333] transition-colors"
              >
                ← Back to {product.project.title}
              </Link>
            )}
            <Link
              href="/projects"
              className="text-[#EF1111] underline text-sm hover:text-[#FF3333] transition-colors"
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
