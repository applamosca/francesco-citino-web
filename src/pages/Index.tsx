import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChiSono from "@/components/ChiSonoNew";
import Servizi from "@/components/Servizi";
import Footer from "@/components/Footer";

const Blog = lazy(() => import("@/components/Blog"));
const Gallery = lazy(() => import("@/components/Gallery"));
const Libro = lazy(() => import("@/components/Libro"));
const Contatti = lazy(() => import("@/components/Contatti"));

const SectionFallback = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ChiSono />
        <Servizi />
        <Suspense fallback={<SectionFallback />}>
          <Blog />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Gallery />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Libro />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contatti />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
