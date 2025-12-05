import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getProjectBySlug, getProjectsByClient } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';
import ProjectsClientWrapper from "../../ProjectsClientWrapper";

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
  const project = await getProjectBySlug(productSlug);

  if (!project || !project.client || project.client.slug !== slug) {
    notFound();
  }

  // Get all projects for this client to find next/previous
  const allProjects = await getProjectsByClient(project.client._id);
  const currentIndex = allProjects.findIndex((p: any) => p.slug === productSlug);
  const nextProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const previousProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
  // Use next project, or previous, or current if only one
  const displayProject = nextProject || previousProject || project;

  const heroImageUrl = project.heroImage
    ? urlFor(project.heroImage).width(1200).height(800).url()
    : null;
  
  const nextProjectImageUrl = displayProject.image
    ? urlFor(displayProject.image).width(1200).height(800).url()
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
            {project.client && (
              <>
                <Link href={`/projects/${project.client.slug}`} className="hover:underline">
                  {project.client.title}
                </Link>
                <span className="text-white mt-0.5">&gt;</span>
              </>
            )}
            <span className="text-white">{project.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero Section - Full width hero image with overlay */}
      <section className="relative w-full h-[400px] md:h-[400px] overflow-hidden">
        {heroImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        {/* Text overlay on left */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl">
              {project.client && project.client.name && (
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#00FF00]">
                  {project.client.name}
                </h1>
              )}
              <h2 className="text-6xl md:text-7xl font-bold mb-4 text-white">
                {project.title}
              </h2>
              {project.subtitle && (
                <p className="text-lg md:text-xl text-white font-normal">
                  {project.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Section */}
      {project.achievements && project.achievements.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <p className="text-lg md:text-xl text-white mb-6">Overview</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Heading */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Achievement
                </h2>
              </div>

              {/* Right Side - Achievements in Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.achievements.map((achievement: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    {/* Red triangular play button icon - 40px */}
                    <div className="flex-shrink-0 mt-1">
                      <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                        <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
                      </svg>
                    </div>
                    <p className="text-base mt-2 md:text-lg text-white/90 leading-relaxed">
                      {achievement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Project Section */}
      {project.about && (
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
                <h3 className="text-2xl font-bold text-black">About Project</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {project.about}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* First Image Section (Single) */}
      {project.imageSections && project.imageSections[0] && project.imageSections[0].layout === 'single' && project.imageSections[0].images && project.imageSections[0].images[0] && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            {/* Red play button with Images text */}
            <div className="flex items-center gap-3 mb-8">
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
              </svg>
              <h3 className="text-3xl md:text-4xl font-bold text-[#EF1111]">
                Images
              </h3>
            </div>
            <div className="relative w-full h-[500px] md:h-[600px] mb-4">
              <Image
                src={urlFor(project.imageSections[0].images[0].image).width(1200).height(800).url()}
                alt={project.imageSections[0].images[0].caption || 'Image'}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            {project.imageSections[0].images[0].caption && (
              <p className="text-gray-700 text-center text-lg">{project.imageSections[0].images[0].caption}</p>
            )}
          </div>
        </section>
      )}

      {/* Challenges Section */}
      {project.challengesText && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl md:text-3xl mb-8 text-white">
              Challenges
            </h2>
            <div className="bg-white rounded-2xl p-8">
              <p className="text-gray-700 font-bold leading-relaxed text-lg">
                {project.challengesText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Second Image Section (Grid) */}
      {project.imageSections && project.imageSections[1] && project.imageSections[1].layout === 'grid' && project.imageSections[1].images && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            {/* Red play button with Images text */}
            <div className="flex items-center gap-3 mb-8">
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
              </svg>
              <h3 className="text-3xl md:text-4xl font-bold text-[#EF1111]">
                Images
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top two images */}
              {project.imageSections[1].images.slice(0, 2).map((img: any, idx: number) => (
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
                    <p className="text-gray-700 text-center text-lg">{img.caption}</p>
                  )}
                </div>
              ))}
              {/* Bottom full-width image */}
              {project.imageSections[1].images[2] && (
                <div className="md:col-span-2 mb-6">
                  <div className="relative w-full h-[400px] md:h-[500px] mb-4">
                    <Image
                      src={urlFor(project.imageSections[1].images[2].image).width(1200).height(800).url()}
                      alt={project.imageSections[1].images[2].caption || 'Image'}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  {project.imageSections[1].images[2].caption && (
                    <p className="text-gray-700 text-center text-lg">{project.imageSections[1].images[2].caption}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Focus Section */}
      {project.focusText && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl md:text-3xl mb-8 text-white">
              Focus
            </h2>
            <div className="bg-white rounded-2xl p-8">
              <p className="text-gray-700 font-bold leading-relaxed text-lg">
                {project.focusText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Third Image Section (Grid) */}
      {project.imageSections && project.imageSections[2] && project.imageSections[2].layout === 'grid' && project.imageSections[2].images && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            {/* Red play button with Images text */}
            <div className="flex items-center gap-3 mb-8">
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z" fill="#EF1111"/>
              </svg>
              <h3 className="text-3xl md:text-4xl font-bold text-[#EF1111]">
                Images
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top two images */}
              {project.imageSections[2].images.slice(0, 2).map((img: any, idx: number) => (
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
                    <p className="text-gray-700 text-center text-lg">{img.caption}</p>
                  )}
                </div>
              ))}
              {/* Bottom full-width image */}
              {project.imageSections[2].images[2] && (
                <div className="md:col-span-2 mb-6">
                  <div className="relative w-full h-[400px] md:h-[500px] mb-4">
                    <Image
                      src={urlFor(project.imageSections[2].images[2].image).width(1200).height(800).url()}
                      alt={project.imageSections[2].images[2].caption || 'Image'}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  {project.imageSections[2].images[2].caption && (
                    <p className="text-gray-700 text-center text-lg">{project.imageSections[2].images[2].caption}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Results So Far Section */}
      {project.results && project.results.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <p className="text-sm md:text-base text-white/70 mb-4">Impact</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Title and Label */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Result so far
                </h2>
              </div>

              {/* Right Side - Results with play buttons */}
              <div className="space-y-4">
                {project.results.map((result: string, index: number) => (
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

      {/* Next Project Section */}
      {displayProject && (
        <section className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {nextProjectImageUrl && (
            <Image
              src={nextProjectImageUrl}
              alt={displayProject.title}
              fill
              className="object-cover blur-sm"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-22">
            <div className="text-center">
              <Link
                href={`/projects/${slug}/${displayProject.slug}`}
                className="inline-block"
              >
                <p className="text-[#EF1111] text-sm md:text-base mb-14">
                  <span className="underline decoration-[#EF1111] underline-offset-8">
                    Next Project
                  </span>
                </p>
                <h3 className="text-4xl md:text-6xl font-bold text-white">
                  {displayProject.title}
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

