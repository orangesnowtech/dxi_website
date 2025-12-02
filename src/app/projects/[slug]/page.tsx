import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getProjectBySlug, getProjects } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';

// Generate static params for all projects
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project: any) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const heroImageUrl = project.heroImage
    ? urlFor(project.heroImage).width(1200).height(800).url()
    : null;
  const logoUrl = project.logo
    ? urlFor(project.logo).width(300).height(150).url()
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
              <h1 className="text-6xl md:text-7xl font-bold mb-6 text-[#00FF00]">
                {project.title}
              </h1>
              {project.tagline && (
                <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed">
                  {project.tagline}
                </p>
              )}
              {project.experienceTag && (
                <div className="inline-block">
                  <span className="text-lg md:text-xl text-white font-medium">
                    {project.experienceTag}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Hero Image */}
            {heroImageUrl && (
              <div className="relative w-full h-[400px] md:h-[500px]">
                <Image
                  src={heroImageUrl}
                  alt={project.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What we handle Section */}
      {project.services && project.services.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">
              What we handle for {project.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.services.map((service: string, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  {/* Red triangular play button icon */}
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
                  <p className="text-lg text-white/90">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brief Section */}
      {project.brief && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-lg p-8 max-w-4xl">
              {/* Red circular icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#EF1111] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h3 className="text-2xl font-bold text-black">Brief</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {project.brief}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Showcase Section */}
      {project.products && project.products.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">
              {project.title} Showcase
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.products.map((product: any) => {
                const productImageUrl = product.image
                  ? urlFor(product.image).width(600).height(400).url()
                  : null;

                return (
                  <Link
                    key={product._id}
                    href={`/projects/${slug}/products/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/20">
                      {productImageUrl && (
                        <div className="relative w-full h-48 md:h-64">
                          <Image
                            src={productImageUrl}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Red triangular play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                              <svg
                                width="32"
                                height="32"
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
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {product.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {project.results && project.results.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white">
              Result so far for {project.title}
            </h2>
            <div className="space-y-4">
              {project.results.map((result: string, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  {/* Red triangular play button icon */}
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

      {/* Back to Projects */}
      <section className="bg-black py-12">
        <div className="container mx-auto px-6">
          <Link
            href="/projects"
            className="text-[#EF1111] underline text-sm hover:text-[#FF3333] transition-colors"
          >
            ← Back to Projects
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
