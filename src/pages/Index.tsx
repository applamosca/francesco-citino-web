import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChiSono from "@/components/ChiSonoNew";
import Servizi from "@/components/Servizi";
import Blog from "@/components/Blog";
import Gallery from "@/components/Gallery";
import Libro from "@/components/Libro";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";
import FacebookPost from "@/components/FacebookPost";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ChiSono />
        <Servizi />
        <FacebookPost />
        <Blog />
        <Gallery />
        <Libro />
        <Contatti />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
