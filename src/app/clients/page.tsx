import { Suspense } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getClients } from "@/lib/sanity/queries";
import ProjectsClientWrapper from "@/app/projects/ProjectsClientWrapper";
import ClientsContent from "@/app/clients/ClientsContent";

export default async function Clients() {
  let clients = [];
  
  try {
    clients = await getClients();
  } catch (error) {
    console.error('Error fetching clients:', error);
    clients = [];
  }



  return (
    <main className="min-h-screen font-sans">
      <ProjectsClientWrapper />

      {/* Hero */}
      <section className="w-full bg-[#080808] h-36 md:h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl md:text-4xl tracking-wide font-medium">
          Clients
        </h1>
      </section>

      {/* Clients and Projects Content with Filter */}
      <Suspense fallback={<div className="bg-white py-12"><div className="container mx-auto px-6">Loading...</div></div>}>
        <ClientsContent clients={clients} />
      </Suspense>

      {/* Footer */}
      <Footer />
    </main>
  );
}
