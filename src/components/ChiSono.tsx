import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const ChiSono = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="chi-sono" className="py-20 md:py-32 bg-bg-soft" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-8 text-center">
            Chi Sono
          </h2>
          
          <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              Sono Francesco Citino, psicologo e ricercatore nel campo della psicosintesi, 
              psicologia analitica e filosofia dell'azione. Da oltre vent'anni studio il 
              rapporto tra coscienza, volontà e trasformazione personale.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 pt-8 border-t border-border"
            >
              <p className="text-base md:text-lg text-muted-foreground">
                Il mio approccio integra dimensioni psicologiche, filosofiche e spirituali 
                per accompagnare le persone nel loro percorso di crescita e consapevolezza.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChiSono;
