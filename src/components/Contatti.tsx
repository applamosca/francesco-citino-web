import { motion } from "framer-motion";
import { useRef } from "react";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, MapPin, ExternalLink, MessageCircle, Phone } from "lucide-react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ContactForm";

// Email obfuscation utilities to prevent spam bot harvesting
const obfuscateEmail = (email: string): string => {
  // Replace @ and . with text equivalents for display
  return email.replace('@', ' [at] ').replace(/\./g, ' [dot] ');
};

const deobfuscateEmail = (email: string): string => {
  // This returns the original email for mailto links
  return email;
};
const Contatti = () => {
  const ref = useRef(null);
  const { data: content, isLoading } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;

  if (isLoading || !contattiContent) {
    return (
      <section id="contatti" className="min-h-screen flex items-center justify-center bg-background py-20" ref={ref}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="h-12 bg-primary/20 rounded-lg w-1/3 mx-auto mb-8 animate-pulse" />
            <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-muted/30 rounded w-3/4 mx-auto" />
                <div className="h-16 bg-muted/20 rounded-lg" />
              </div>
            </div>
            <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
              <div className="aspect-video bg-muted/30 rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
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
              Per consulenze, informazioni o collaborazioni, puoi contattarmi direttamente via email o WhatsApp.
            </p>

            <div className="space-y-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary/60 transition-all duration-300 group"
                onClick={() => window.location.href = `mailto:${deobfuscateEmail(contattiContent.email)}`}
              >
                <Mail className="mr-4 text-primary group-hover:scale-110 transition-transform duration-300" size={24} />
                <div>
                  <p className="font-semibold text-foreground text-base">Email</p>
                  {/* Email obfuscated to prevent spam bot harvesting */}
                  <p className="text-muted-foreground text-sm" aria-label="Indirizzo email">
                    {obfuscateEmail(contattiContent.email)}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start text-left hover:bg-green-500/5 hover:border-green-500/60 transition-all duration-300 group"
                onClick={() => window.open(`https://wa.me/393201971983?text=${encodeURIComponent('Dottore posso chiedere un appuntamento')}`, '_blank')}
              >
                <img src={whatsappLogo} alt="WhatsApp" className="mr-4 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="font-semibold text-foreground text-base">WhatsApp</p>
                  <p className="text-muted-foreground text-sm">320 197 1983</p>
                </div>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground/60 text-center mt-8 italic">
              Per rimanere aggiornato, seguimi sui social tramite le icone a fondo pagina
            </p>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-card rounded-2xl shadow-lg border border-border/50 p-8 md:p-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <MessageCircle className="text-primary" size={28} />
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
                Scrivimi
              </h3>
            </div>
            <p className="text-base text-center text-muted-foreground mb-8">
              Compila il modulo per inviarmi un messaggio diretto.
            </p>
            <ContactForm />
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
