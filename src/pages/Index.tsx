import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ChiSono from "@/components/ChiSono";
import Servizi from "@/components/Servizi";
import Libro from "@/components/Libro";
import Contatti from "@/components/Contatti";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ChiSono />
        <Servizi />
        <Libro />
        <Contatti />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
