import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getClientBySlug, getClients } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';
import ProjectsClientWrapper from "../ProjectsClientWrapper";

// Generate static params for all clients
export async function generateStaticParams() {
  const clients = await getClients();
  return clients.map((client: any) => ({
    slug: client.slug,
  }));
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);

  if (!client) {
    notFound();
  }

  // Get all clients to find next/previous
  const allClients = await getClients();
  const currentIndex = allClients.findIndex((c: any) => c.slug === slug);
  const nextClient = currentIndex > 0 ? allClients[currentIndex - 1] : null;
  const previousClient = currentIndex < allClients.length - 1 ? allClients[currentIndex + 1] : null;
  // Use next client, or previous, or current if only one
  const displayClient = nextClient || previousClient || client;

  const heroImageUrl = client.heroImage
    ? urlFor(client.heroImage).width(1200).height(800).url()
    : null;
  const logoUrl = client.logo
    ? urlFor(client.logo).width(300).height(150).url()
    : null;
  
  const nextClientImageUrl = displayClient.backgroundImage
    ? urlFor(displayClient.backgroundImage).width(1200).height(800).url()
    : null;

  return (
    <main className="min-h-screen font-sans bg-black text-white">
      <ProjectsClientWrapper />

      {/* Breadcrumb Navigation - Fixed under nav */}
      <section className="sticky top-[85px] z-40 bg-[#EF1111] py-3">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-white text-sm font-medium">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <span className="text-white">{client.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative w-full min-h-[400px] flex items-center bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              {client.name && (
                <h4 className="text-5xl md:text-6xl font-bold mb-4 text-[#00FF00]">
                  {client.name}
                </h4>
              )}
              {client.tagline && (
                <p className="text-3xl md:text-4xl text-white mb-4 leading-relaxed font-normal">
                  {client.tagline}
                </p>
              )}
              {client.experienceTag && (
                <p className="text-lg md:text-xl text-white font-normal">
                  {client.experienceTag}
                </p>
              )}
            </div>

            {/* Right Side - Hero Image */}
            {heroImageUrl && (
              <div className="relative w-full h-[100px] md:h-[200px]">
                <Image
                  src={heroImageUrl}
                  alt={client.title}
                  fill
                  className="object-contain"
                  priority
                />
                {/* Red geometric design at bottom right */}
                {/* <div className="absolute bottom-0 right-0 w-16 h-16">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M32 0L64 32L32 64L0 32L32 0Z"
                      fill="#EF1111"
                      opacity="0.8"
                    />
                    <path
                      d="M32 16L48 32L32 48L16 32L32 16Z"
                      fill="#EF1111"
                    />
                  </svg>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What we handle Section */}
      {client.services && client.services.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <p className="text-lg md:text-xl text-white mb-6">Overview</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Overview and Heading */}
              <div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  What we handle
                  <br />
                  for {client.title}
                </h2>
              </div>

              {/* Right Side - Services in Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {client.services.map((service: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                     {/* Red triangular play button icon */}
                     <div className="flex-shrink-0 mt-1">
                       <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                         <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
                       </svg>

                    </div>
                    <p className="text-base mt-2 md:text-lg text-white/90 leading-relaxed">
                      {service}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Brief Section */}
      {client.brief && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-lg p-8 w-full">
              {/* Red circular icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M37.856 25.2091C33.1151 1.37952 48.879 1.37952 44.1382 25.2091C48.879 1.37952 63.4435 7.41099 49.9446 27.6137C63.4435 7.41099 74.589 18.5565 54.3863 32.0554C74.589 18.5565 80.6205 33.121 56.7909 37.859C80.6205 33.1181 80.6205 48.882 56.7909 44.1412C80.6205 48.882 74.5862 63.4436 54.3863 49.9447C74.5862 63.4436 63.4406 74.5891 49.9446 54.3864C63.4435 74.5863 48.879 80.6178 44.141 56.791C48.8819 80.6206 33.118 80.6206 37.8588 56.791C33.118 80.6206 18.5564 74.5863 32.0553 54.3864C18.5564 74.5863 7.41086 63.4407 27.6136 49.9447C7.41371 63.4436 1.38223 48.8792 25.209 44.1412C1.37939 48.882 1.37939 33.1181 25.209 37.859C1.37939 33.1181 7.41371 18.5565 27.6136 32.0554C7.41371 18.5565 18.5593 7.41099 32.0553 27.6137C18.5564 7.41384 33.1208 1.38236 37.8588 25.2091H37.856Z" fill="#EF1111"/>
                  </svg>

                </div>
                <h3 className="text-2xl font-bold text-black">Brief</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {client.brief}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Showcase Section */}
      {client.products && client.products.length > 0 && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <p className="text-base md:text-lg text-gray-600 mb-2">Portfolio</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-black">
              {client.title} Showcase
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {client.products.map((project: any) => {
                const projectImageUrl = project.image
                  ? urlFor(project.image).width(600).height(400).url()
                  : null;

                return (
                  <Link
                    key={project._id}
                    href={`/projects/${slug}/${project.slug}`}
                    className="group"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                      {projectImageUrl && (
                        <div className="relative w-full h-64 md:h-80">
                          <Image
                            src={projectImageUrl}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* White overlay at bottom with play button and title */}
                          <div className="absolute bottom-5 left-5 right-5 bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                            {/* Red play button icon */}
                            <div className="flex-shrink-0">
                            <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                              <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
                            </svg>

                            </div>
                            {/* Project title */}
                            <h3 className="text-base md:text-lg font-bold text-black">
                              {project.title}
                            </h3>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {client.results && client.results.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <p className="text-sm md:text-base text-white/70 mb-4">Result Driven Metrics</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Title and Label */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Result so far for {client.title}
                </h2>
              </div>

              {/* Right Side - Results with play buttons */}
              <div className="space-y-4">
                {client.results.map((result: string, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    {/* Red triangular play button icon */}
                    <div className="flex-shrink-0 mt-1">
                      <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                        <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
                      </svg>
                    </div>
                    <p className="text-lg text-white/90 leading-relaxed">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Next Client Section */}
      {displayClient && (
        <section className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {nextClientImageUrl && (
            <Image
              src={nextClientImageUrl}
              alt={displayClient.title}
              fill
              className="object-cover blur-sm"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-22">
            <div className="text-center">
              <Link
                href={`/projects/${displayClient.slug}`}
                className="inline-block"
              >
                <p className="text-[#EF1111] text-sm md:text-base mb-14">
                  <span className="underline decoration-[#EF1111] underline-offset-8">
                    Next Client
                  </span>
                </p>
                <h3 className="text-4xl md:text-6xl font-bold text-white">
                  {displayClient.name || displayClient.title}
                </h3>
              </Link>
            </div>
          </div>
        </section>
      )}

      

      <Footer />
    </main>
  );
}
