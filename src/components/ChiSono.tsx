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
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
              Mi occupo prevalentemente di crescita personale, con una formazione multidisciplinare 
              che abbraccia diversi ambiti del sapere. Oltre alla laurea in Psicologia, sono laureato 
              in Scienze Cognitive, diplomato Ipnologo presso la scuola "Psicotecnica" di Milano e 
              laureato in Filosofie d'Oriente e d'Occidente presso l'Università L'Orientale di Napoli.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 pt-8 border-t border-border space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4">Il mio approccio</h3>
                <p className="text-base md:text-lg text-muted-foreground mb-4">
                  Il mio lavoro si fonda su un approccio integrato e innovativo che unisce:
                </p>
                <ul className="space-y-2 text-base md:text-lg text-muted-foreground ml-4">
                  <li>• <strong>Psicologia Positiva</strong> per valorizzare le risorse e i punti di forza</li>
                  <li>• <strong>Psicologia Transpersonale</strong> per esplorare le dimensioni più profonde dell'essere</li>
                  <li>• <strong>Scienze Cognitive</strong> per comprendere i meccanismi della mente</li>
                  <li>• <strong>Ipnosi</strong> come strumento di apprendimento</li>
                  <li>• <strong>Filosofie Orientali</strong> come metodi di trasformazione e di crescita</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-base md:text-lg text-muted-foreground mb-4">
                  Opero sullo sviluppo del potenziale umano, accompagnando le persone in un percorso 
                  di crescita che mira a:
                </p>
                <ul className="space-y-2 text-base md:text-lg text-muted-foreground ml-4">
                  <li>• <strong>Migliorare la consapevolezza di sé</strong> attraverso tecniche di auto-osservazione</li>
                  <li>• <strong>Potenziare l'autostima</strong> riconoscendo e valorizzando le proprie qualità</li>
                  <li>• <strong>Aumentare la fiducia in sé stessi</strong> superando blocchi e limitazioni</li>
                  <li>• <strong>Ottimizzare le performance</strong> in ambito personale e professionale</li>
                </ul>
              </div>

              <p className="text-base md:text-lg text-muted-foreground pt-6 italic">
                Credo fermamente che ogni persona possieda in sé le risorse necessarie per realizzare 
                il proprio potenziale. Il mio ruolo è quello di facilitare questo processo di scoperta 
                e crescita, creando uno spazio sicuro dove esplorare nuove possibilità e sviluppare una 
                maggiore armonia interiore.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChiSono;
