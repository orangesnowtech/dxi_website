"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";

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
  projects: Project[];
}

export default function ProjectsContent({ projects }: ProjectsContentProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  // Filter projects if needed (e.g., by category from URL)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  useEffect(() => {
    if (categoryParam) {
      // Add your filtering logic here if needed
      // For now, just show all projects
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects);
    }
  }, [categoryParam, projects]);

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-6">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-base text-gray-800 mb-4">
            Our Projects
          </h1>
        </div>

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
                    {project.client?.slug && (
                      <Link href={`/projects/${project.client.slug}/${project.slug}`}>
                        {/* project image */}
                        {projectImageUrl && (
                          <div className="relative w-full h-32 sm:h-48 lg:h-56 group-hover:scale-105 transition-transform duration-300">
                            <Image
                              src={projectImageUrl}
                              alt={project.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/45" />
                          </div>
                        )}
                      </Link>
                    )}
                  </div>

                  {/* title + client name */}
                  <div className="px-4 py-5">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      {project.title}
                    </h4>
                    {project.client && (
                      <p className="text-xs text-gray-600 mb-3">
                        {project.client.title || project.client.name}
                      </p>
                    )}
                    
                    {/* View project link */}
                    {/* {project.client?.slug && (
                      <div className="mt-2">
                        <Link
                          href={`/projects/${project.client.slug}/${project.slug}`}
                          className="text-xs text-[#EF1111] underline whitespace-nowrap"
                          aria-label={`View ${project.title} project`}
                        >
                          View Project
                        </Link>
                      </div>
                    )} */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}