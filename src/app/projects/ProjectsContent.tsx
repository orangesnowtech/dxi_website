"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import ProjectsFilter from "./ProjectsFilter";

type FilterType = "clients" | "projects";

interface Client {
  _id: string;
  title: string;
  slug: string;
  backgroundImage?: any;
  logo?: any;
}

interface Project {
  _id: string;
  title: string;
  slug: string;
  image?: any;
  client?: {
    _id: string;
    title: string;
    name?: string;
    slug: string;
  };
}

interface ProjectsContentProps {
  clients: Client[];
  projects: Project[];
}

export default function ProjectsContent({ clients, projects }: ProjectsContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialFilter: FilterType = tabParam === "projects" ? "projects" : "clients";
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  
  // Update filter when URL param changes
  useEffect(() => {
    if (tabParam === "projects") {
      setFilter("projects");
    } else if (tabParam === "clients") {
      setFilter("clients");
    }
  }, [tabParam]);

  const filteredClients = filter === "clients" ? clients : [];
  const filteredProjects = filter === "projects" ? projects : [];

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-base text-gray-800">
            {filter === "clients" ? "Clients" : "Projects"}
          </h3>
          <ProjectsFilter onFilterChange={setFilter} currentFilter={filter} />
        </div>

        {filter === "clients" ? (
          <>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No clients found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClients.map((p: Client) => {
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
          </>
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No projects found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project: Project) => {
                  const projectImageUrl = project.image
                    ? urlFor(project.image).width(800).height(600).url()
                    : null;

                  return (
                    <div key={project._id} className="group overflow-hidden">
                      <div className="group bg-white rounded-2xl shadow-md overflow-hidden">
                        {/* project image */}
                        {projectImageUrl && (
                          <div className="relative w-full h-32 sm:h-48 lg:h-56">
                            <Image
                              src={projectImageUrl}
                              alt={project.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* title + client name + view link */}
                      <div className="px-4 py-5">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          {project.title}
                        </h4>
                        {project.client && (
                          <p className="text-xs text-gray-600 mb-3">
                            {project.client.title || project.client.name}
                          </p>
                        )}
                        {project.client?.slug && (
                          <div className="flex justify-end">
                            <Link
                              href={`/projects/${project.client.slug}/${project.slug}`}
                              className="text-xs text-[#EF1111] underline whitespace-nowrap"
                              aria-label={`View ${project.title} project`}
                            >
                              View Project
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

