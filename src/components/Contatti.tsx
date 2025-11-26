import { motion } from "framer-motion";
import { useRef } from "react";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contatti = () => {
  const ref = useRef(null);
  const { data: content, isLoading } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;

  if (isLoading || !contattiContent) {
    return <section id="contatti" className="min-h-screen flex items-center justify-center bg-background" ref={ref} />;
  }

  return (
    <section id="contatti" className="min-h-screen flex items-center justify-center bg-background py-20" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-8 text-center">
            Contatti
          </h2>

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
        </motion.div>
      </div>
    </section>
  );
};

export default Contatti;
