import { motion } from "framer-motion";
import { useRef } from "react";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contatti = () => {
  const ref = useRef(null);
  const { data: content, isLoading } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;

  if (isLoading || !contattiContent) {
    return <section id="contatti" className="min-h-screen flex items-center justify-center bg-background" ref={ref} />;
  }

  const studioAddress = {
    street: "Via Andria, 52",
    city: "Barletta",
    postalCode: "76121",
    country: "Italia",
    fullAddress: "Via Andria, 52, 76121 Barletta BT, Italia"
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Francesco Citino – Psicologo, Ricercatore, Autore",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": studioAddress.street,
      "addressLocality": studioAddress.city,
      "postalCode": studioAddress.postalCode,
      "addressCountry": "IT"
    },
    "url": "https://francescocitino.it",
    "description": "Studio di psicologia e ricerca, consulenze e percorsi di crescita personale."
  };

  return (
    <section id="contatti" className="min-h-screen flex items-center justify-center bg-background py-20" ref={ref}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl mx-auto space-y-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-8 text-center">
            Contatti
          </h2>

          {/* Email Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12"
          >
            <p className="text-base md:text-lg text-center text-muted-foreground mb-10 leading-relaxed">
              Per consulenze, informazioni o collaborazioni, puoi contattarmi direttamente via email.
            </p>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary/60 transition-all duration-300 group"
              onClick={() => window.location.href = `mailto:${contattiContent.email}`}
            >
              <Mail className="mr-4 text-primary group-hover:scale-110 transition-transform duration-300" size={24} />
              <div>
                <p className="font-semibold text-foreground text-base">Email</p>
                <p className="text-muted-foreground text-sm">{contattiContent.email}</p>
              </div>
            </Button>

            <p className="text-xs text-muted-foreground/60 text-center mt-8 italic">
              Per rimanere aggiornato, seguimi sui social tramite le icone a fondo pagina
            </p>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <MapPin className="text-primary" size={28} />
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
                Dove ricevo
              </h3>
            </div>

            <div className="relative w-full overflow-hidden rounded-3xl shadow-xl">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src="https://www.google.com/maps?q=Via+Andria,+52,+76121+Barletta+BT,+Italia&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mappa Studio Francesco Citino"
                  aria-label="Mappa della posizione dello studio a Barletta"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-center">
                <p className="text-base md:text-lg font-medium text-foreground mb-1">
                  {studioAddress.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  {studioAddress.postalCode} {studioAddress.city}, {studioAddress.country}
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center hover:bg-primary/5 hover:border-primary/60 transition-all duration-300 group"
                onClick={() => window.open(`https://www.google.com/maps?q=${encodeURIComponent(studioAddress.fullAddress)}`, '_blank')}
              >
                <ExternalLink className="mr-3 text-primary group-hover:scale-110 transition-transform duration-300" size={20} />
                <span className="font-semibold">Apri su Google Maps</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contatti;
