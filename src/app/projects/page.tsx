import Link from "next/link";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getProjects } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import ProjectsClientWrapper from "./ProjectsClientWrapper";

export default async function Projects() {
  let projects = [];
  try {
    projects = await getProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return empty array if fetch fails
    projects = [];
  }

  return (
    <main className="min-h-screen font-sans">
      <ProjectsClientWrapper />

      {/* Hero */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          Projects
        </h1>
      </section>

      {/* Clients Card */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <h3 className="text-base text-gray-800 mb-8">Clients</h3>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No projects found.</p>
              {/* <p className="text-sm text-gray-500">
                Add your first project in{' '}
                <a
                  href="/studio"
                  className="text-[#EF1111] underline"
                >
                  Sanity Studio
                </a>
              </p> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p: any) => {
              const bgImageUrl = p.backgroundImage
                ? urlFor(p.backgroundImage).width(800).height(600).url()
                : null;
              const logoUrl = p.logo
                ? urlFor(p.logo).width(300).height(150).url()
                : null;

              return (
                <div key={p._id} className="group overflow-hidden">
                  <div className="group bg-white rounded-2xl shadow-md overflow-hidden">
                    {/* image background */}
                    {bgImageUrl && (
                      <div className="relative w-full h-32 sm:h-48 lg:h-56">
                        <Image
                          src={bgImageUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                        {/* centered white card with logo (white rectangle under logo) */}
                        {logoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white rounded-md px-6 py-4 shadow-sm flex items-center justify-center min-w-[160px]">
                              <Image
                                src={logoUrl}
                                alt={p.title}
                                width={160}
                                height={64}
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* title + view link (title sits below the image card, link on the right) */}
                  <div className="px-4 py-5 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {p.title}
                    </h4>

                    <Link
                      href={`/projects/${p.slug}`}
                      className="text-xs text-[#EF1111] underline whitespace-nowrap"
                      aria-label={`View ${p.title} project`}
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
