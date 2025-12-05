import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getClients, getAllProjects } from "@/lib/sanity/queries";
import ProjectsClientWrapper from "./ProjectsClientWrapper";
import ProjectsContent from "./ProjectsContent";

export default async function Projects() {
  let clients = [];
  let projects = [];
  
  try {
    clients = await getClients();
  } catch (error) {
    console.error('Error fetching clients:', error);
    clients = [];
  }

  try {
    projects = await getAllProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
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

      {/* Clients and Projects Content with Filter */}
      <ProjectsContent clients={clients} projects={projects} />

      {/* Footer */}
      <Footer />
    </main>
  );
}
