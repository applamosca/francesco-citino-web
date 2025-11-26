import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const servizi = [
  {
    icon: Brain,
    title: "Consulenza Psicologica",
    description: "Percorsi individuali di sostegno psicologico per la crescita personale e il benessere emotivo.",
  },
  {
    icon: BookOpen,
    title: "Ricerca e Formazione",
    description: "Attività di ricerca nel campo della psicosintesi e formazione per professionisti del settore.",
  },
  {
    icon: Users,
    title: "Supervisione Professionale",
    description: "Supervisione e consulenza per psicologi e professionisti della relazione d'aiuto.",
  },
];

const Servizi = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="servizi" className="py-20 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-12 text-center">
            Servizi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {servizi.map((servizio, index) => {
              const Icon = servizio.icon;
              return (
                <motion.div
                  key={servizio.title}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-border hover:border-primary">
                    <CardHeader>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Icon className="text-primary" size={32} />
                      </div>
                      <CardTitle className="text-xl md:text-2xl text-foreground">
                        {servizio.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-muted-foreground">
                        {servizio.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Servizi;
