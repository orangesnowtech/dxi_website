import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getConceptBySlug, getConcepts } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';
import ConceptsClientWrapper from "../ConceptsClientWrapper";
import ConceptReactions from './ConceptReactions';
import ConceptReactionsSection from './ConceptReactionsSection';
import MoreLikeThisSection from './MoreLikeThisSection';

// Generate static params for all concepts
export async function generateStaticParams() {
  const concepts = await getConcepts();
  return concepts.map((concept: any) => ({
    slug: concept.slug,
  }));
}

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);

  if (!concept) {
    notFound();
  }

  // Get all concepts and filter out current concept
  const allConcepts = await getConcepts();
  const otherConcepts = allConcepts.filter((c: any) => c.slug !== slug);

  const brandImageUrl = concept.brandImage
    ? urlFor(concept.brandImage).width(1200).height(800).url()
    : null;

  return (
    <main className="min-h-screen font-sans bg-black text-white">
      <ConceptsClientWrapper />

      {/* Breadcrumb Navigation - Fixed under nav */}
      <section className="sticky top-[85px] z-40 bg-[#EF1111] py-3">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-white text-sm font-medium">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <Link href="/concepts" className="hover:underline">
              Concepts
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <span className="text-white">{concept.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-6">
            {/* First Row: Title and Month/Year */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {concept.title}
              </h1>
              {concept.monthYear && (
                <span className="text-xl md:text-2xl text-white/80 mt-2 whitespace-nowrap">
                  {concept.monthYear}
                </span>
              )}
            </div>

            {/* Second Row: Team and Reactions */}
            <div className="flex items-center justify-between gap-4">
              {concept.team && (
                <p className="text-lg md:text-xl text-white/80">
                  {concept.team}
                </p>
              )}
              <div>
                <ConceptReactions
                  conceptId={concept._id}
                  initialCounts={concept.reactionCounts}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Image Section */}
      {brandImageUrl && (
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-6">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
              <Image
                src={brandImageUrl}
                alt={concept.brandName || concept.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Brand Name */}
      {concept.brandName && (
        <section className="bg-white py-6">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
              {concept.brandName}
            </h2>
          </div>
        </section>
      )}

      {/* About Section */}
      {concept.about && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-6">
            <p className="text-lg md:text-xl text-black leading-relaxed w-full">
              {concept.about}
            </p>
          </div>
        </section>
      )}

      {/* Two Images Side by Side */}
      {concept.twoImages && concept.twoImages.length >= 2 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {concept.twoImages.slice(0, 2).map((img: any, index: number) => {
                const imageUrl = urlFor(img).width(800).height(600).url();
                return (
                  <div
                    key={index}
                    className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* First Description */}
      {concept.description1 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-6">
            <p className="text-lg md:text-xl text-black leading-relaxed w-full">
              {concept.description1}
            </p>
          </div>
        </section>
      )}

      {/* Three Images Section - Large top, two side by side below */}
      {concept.threeImages && concept.threeImages.length >= 3 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-6">
            <div className="space-y-6">
              {/* Large image on top */}
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                <Image
                  src={urlFor(concept.threeImages[0]).width(1200).height(800).url()}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              {/* Two images side by side below */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {concept.threeImages.slice(1, 3).map((img: any, index: number) => {
                  const imageUrl = urlFor(img).width(800).height(600).url();
                  return (
                    <div
                      key={index}
                      className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Image ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Second Description - 2 Paragraphs */}
      {concept.description2 && concept.description2.length > 0 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-6">
            <div className="space-y-6 w-full">
              {concept.description2.map((paragraph: string, index: number) => (
                <p
                  key={index}
                  className="text-lg md:text-xl text-black leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {concept.galleryImages && concept.galleryImages.length > 0 && (
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-6">
            <div className="space-y-6">
              {/* First large image */}
              {concept.galleryImages[0] && (
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(concept.galleryImages[0]).width(1200).height(800).url()}
                    alt="Gallery image 1"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Second large image */}
              {concept.galleryImages[1] && (
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(concept.galleryImages[1]).width(1200).height(800).url()}
                    alt="Gallery image 2"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Two images side by side */}
              {concept.galleryImages[2] && concept.galleryImages[3] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                    <Image
                      src={urlFor(concept.galleryImages[2]).width(800).height(600).url()}
                      alt="Gallery image 3"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                    <Image
                      src={urlFor(concept.galleryImages[3]).width(800).height(600).url()}
                      alt="Gallery image 4"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Fourth large image */}
              {concept.galleryImages[4] && (
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(concept.galleryImages[4]).width(1200).height(800).url()}
                    alt="Gallery image 5"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Fifth large image */}
              {concept.galleryImages[5] && (
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(concept.galleryImages[5]).width(1200).height(800).url()}
                    alt="Gallery image 6"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Results So Far Section */}
      {concept.results && concept.results.length > 0 && (
        <section className="bg-black py-16">
          <div className="container mx-auto px-6">
            <p className="text-sm md:text-base text-white/70 mb-4">Impact</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Title */}
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Result so far
                </h2>
              </div>

              {/* Right Side - Results with play buttons */}
              <div className="space-y-4">
                {concept.results.map((result: string, index: number) => (
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

      {/* Reactions Section */}
      <ConceptReactionsSection
        conceptId={concept._id}
        initialCounts={concept.reactionCounts}
      />

      {/* More Like This Section */}
      <MoreLikeThisSection concepts={otherConcepts} />

      <Footer />
    </main>
  );
}
