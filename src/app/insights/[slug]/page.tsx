import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getInsightBySlug, getInsights } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';
import InsightsClientWrapper from '../InsightsClientWrapper';

// Generate static params for all insights
export async function generateStaticParams() {
  const insights = await getInsights();
  return insights.map((insight: any) => ({
    slug: insight.slug,
  }));
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);

  if (!insight) {
    notFound();
  }

  // Get all insights to find next insight
  const allInsights = await getInsights();
  const currentIndex = allInsights.findIndex((i: any) => i.slug === slug);
  const nextInsight = currentIndex > 0 ? allInsights[currentIndex - 1] : null;
  const previousInsight = currentIndex < allInsights.length - 1 ? allInsights[currentIndex + 1] : null;
  // Use next insight, or previous, or current if only one
  const displayInsight = nextInsight || previousInsight || insight;

  const featuredImageUrl = insight.featuredImage
    ? urlFor(insight.featuredImage).width(1200).height(800).url()
    : null;

  const headerImageUrl = insight.headerImage
    ? urlFor(insight.headerImage).width(1200).height(600).url()
    : null;

  const nextInsightImageUrl = displayInsight.featuredImage
    ? urlFor(displayInsight.featuredImage).width(1200).height(800).url()
    : null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Get ordinal suffix
    const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? "st" :
                   dayNum === 2 || dayNum === 22 ? "nd" :
                   dayNum === 3 || dayNum === 23 ? "rd" : "th";
    
    return `${day}, ${dayNum}${suffix}, ${month} ${year}`;
  };

  return (
    <main className="min-h-screen font-sans bg-white">
      <Nav isSticky={false} />
      <InsightsClientWrapper />

      {/* Breadcrumb Navigation - Fixed under nav */}
      <section className="sticky top-[85px] z-40 bg-[#EF1111] py-3">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-white text-sm font-medium">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <Link href="/insights" className="hover:underline">
              Insights
            </Link>
            <span className="text-white mt-0.5">&gt;</span>
            <span className="text-white">{insight.title}</span>
          </nav>
        </div>
      </section>

      {/* Header Section - Dark Grey Background */}
      <section className="relative bg-gray-800 py-12 md:py-16 min-h-[400px]">
        {headerImageUrl && (
          <div className="absolute inset-0 opacity-30">
            <Image
              src={headerImageUrl}
              alt={insight.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Content */}
            <div>
              {/* Categories */}
              {insight.categories && insight.categories.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-6">
                  {insight.categories.map((category: any) => (
                    <Link
                      key={category._id}
                      href={`/insights?category=${category._id}`}
                      className="text-sm font-medium text-[#EF1111] border-t-2 border-[#EF1111] pt-1 hover:opacity-80 transition-opacity"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                {insight.title}
              </h1>

              {/* Author */}
              <p className="text-lg text-white mb-2">{insight.author}</p>

              {/* Reading Time and Date */}
              <div className="flex items-center gap-2 text-white text-sm">
                <span>{insight.readingTime} mins read</span>
                <span className="font-bold">•</span>
                <span>{formatDate(insight.publishedDate)}</span>
              </div>
            </div>

            
          </div>
        </div>
      </section>

      {/* Article Content Section - White Background */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-6 w-full">
          {insight.content && insight.content.length > 0 ? (
            insight.content.map((section: any, index: number) => {
              // Text Section
              if (section._type === 'textSection' || (section.heading || section.paragraphs)) {
                return (
                  <div key={index} className="mb-12">
                    {section.heading && (
                      <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                        {section.heading}
                      </h2>
                    )}
                    {section.paragraphs && section.paragraphs.length > 0 && (
                      <div className="space-y-4">
                        {section.paragraphs.map((paragraph: string, pIndex: number) => (
                          <p
                            key={pIndex}
                            className="text-base md:text-lg text-black leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Image Section
              if (section._type === 'imageSection' || section.layout) {
                return (
                  <div key={index} className="mb-12">
                    {/* Images Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 60 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10"
                      >
                        <path
                          d="M44.4946 38.4535C48.6599 36.0637 50.7426 34.8687 51.6224 33.4197C52.898 31.3188 52.898 28.6813 51.6224 26.5803C50.7426 25.1313 48.6599 23.9364 44.4946 21.5465L21.9918 8.63545C17.8664 6.2685 15.8037 5.08502 14.1184 5.05379C11.6749 5.00852 9.40785 6.32379 8.23212 8.46887C7.42121 9.94835 7.42122 12.3285 7.42122 17.0889V42.9111C7.42122 47.6715 7.42121 50.0517 8.23212 51.5312C9.40785 53.6763 11.6749 54.9915 14.1184 54.9463C15.8037 54.915 17.8664 53.7316 21.9918 51.3646L44.4946 38.4535Z"
                          fill="#EF1111"
                        />
                      </svg>
                      <h3 className="text-2xl md:text-3xl font-bold text-black">Images</h3>
                    </div>

                    {/* Single Large Image */}
                    {section.layout === 'single' && section.images && section.images[0] && (
                      <div className="mb-6">
                        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden mb-4">
                          <Image
                            src={urlFor(section.images[0].image).width(1200).height(800).url()}
                            alt={section.images[0].caption || 'Insight image'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {section.images[0].caption && (
                          <p className="text-base md:text-lg text-center font-semibold text-black mb-2">
                            {section.images[0].caption}
                          </p>
                        )}
                        {section.images[0].subtext && (
                          <p className="text-base text-center text-gray-600">{section.images[0].subtext}</p>
                        )}
                      </div>
                    )}

                    {/* Two Images Side by Side */}
                    {section.layout === 'two' && section.images && section.images.length >= 2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.images.slice(0, 2).map((img: any, imgIndex: number) => (
                          <div key={imgIndex}>
                            <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-4">
                              <Image
                                src={urlFor(img.image).width(800).height(600).url()}
                                alt={img.caption || 'Insight image'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {img.caption && (
                              <p className="text-base md:text-lg text-center font-semibold text-black">
                                {img.caption}
                              </p>
                            )}
                            {img.subtext && (
                              <p className="text-base text-center text-gray-600 mt-2">{img.subtext}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })
          ) : (
            <div className="text-center text-gray-500">
              <p>Content coming soon...</p>
            </div>
          )}
        </div>
      </section>

      {/* Next Insight Section */}
      {displayInsight && (
        <section className="relative bg-black py-20 md:py-24 min-h-[400px] flex items-center">
          {nextInsightImageUrl && (
            <div className="absolute inset-0 opacity-40 blur-md">
              <Image
                src={nextInsightImageUrl}
                alt={displayInsight.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="container mx-auto px-6 relative z-10 text-center">
            <Link
              href={`/insights/${displayInsight.slug}`}
              className="block"
            >
              <p className="text-[#EF1111] text-sm md:text-base mb-6">
                <span className="underline decoration-[#EF1111] underline-offset-8">
                  Next Insight
                </span>
              </p>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {displayInsight.title}
              </h3>
              <div className="flex items-center justify-center gap-2 text-white text-sm">
                <span>{displayInsight.readingTime} mins read</span>
                <span className="font-bold text-black">•</span>
                <span>{formatDate(displayInsight.publishedDate)}</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

