import Link from "next/link";
import Image from "next/image";
import { getClients } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import BrandsSectionClient from "./BrandsSectionClient";

export default async function BrandsSection() {
  let clients = [];
  
  try {
    clients = await getClients();
  } catch (error) {
    console.error('Error fetching clients:', error);
    clients = [];
  }

  return <BrandsSectionClient clients={clients} />;
}

