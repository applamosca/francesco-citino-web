import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import bookCover from "@/assets/book-cover.jpg";

const Libro = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="libro" className="py-20 md:py-32 bg-bg-soft" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-12 text-center">
            Il Libro: Filosofia dell'Azione
          </h2>

          <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center"
              >
                <img
                  src={bookCover}
                  alt="Copertina del libro Filosofia dell'Azione"
                  className="max-w-full h-auto rounded-lg shadow-2xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col justify-center"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Un'esplorazione profonda della coscienza e della volontà
                </h3>
                
                <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                  "Filosofia dell'Azione" rappresenta il culmine di oltre vent'anni di ricerca 
                  nel campo della psicosintesi e della psicologia analitica. Un viaggio attraverso 
                  i meccanismi della volontà e i processi di trasformazione personale.
                </p>

                <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                  Il libro integra prospettive filosofiche, psicologiche e spirituali per offrire 
                  strumenti concreti di crescita e consapevolezza.
                </p>

                <Button
                  size="lg"
                  className="bg-primary hover:bg-accent text-primary-foreground w-full md:w-auto"
                  onClick={() => window.open("#", "_blank")}
                >
                  Acquista Ora
                  <ExternalLink className="ml-2" size={20} />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Libro;
