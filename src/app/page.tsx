import Footer from "./components/Footer";
import BrandsSection from "./components/BrandsSection";
import InsightsSection from "./components/InsightsSection";
import WhoWeAreSection from "./components/WhoWeAreSection";
import ServicesSection from "./components/ServicesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import HomeClientWrapper from "./components/HomeClientWrapper";
import { getHomepageSettings } from "@/lib/sanity/queries";

export default async function Home() {
  const homepageSettings = await getHomepageSettings();

  return (
    <main className="min-h-screen font-sans">
      <HomeClientWrapper
        heroImage={homepageSettings?.heroImage}
        heading1={homepageSettings?.heading1}
        heading2={homepageSettings?.heading2}
        buttonText={homepageSettings?.buttonText}
        buttonLink={homepageSettings?.buttonLink}
      />

      {/* WHO WE ARE */}
      <WhoWeAreSection />

      {/* Services */}
      <ServicesSection />

      {/* Brands We Represent */}
      <BrandsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Our Insights */}
      <InsightsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
