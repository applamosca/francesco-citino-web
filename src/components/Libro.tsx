import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useContent, type LibroContent } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, Users, Lightbulb, BookOpen } from "lucide-react";
import bookCover from "@/assets/libro-cover.jpg";

const Libro = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content, isLoading } = useContent("libro");
  const libroContent = content as unknown as LibroContent;

  if (isLoading || !libroContent) {
    return <section id="libro" className="py-20 md:py-32 bg-bg-soft" ref={ref} />;
  }

  return (
    <section id="libro" className="py-20 md:py-32 bg-bg-soft" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 text-center">
            {libroContent.title}
          </h2>
          <p className="text-xl md:text-2xl text-accent text-center mb-12 font-medium">
            {libroContent.subtitle}
          </p>

          {/* Hero Section con copertina */}
          <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center"
              >
                <img
                  src={bookCover}
                  alt={`Copertina del libro ${libroContent.title}`}
                  className="max-w-full h-auto rounded-lg shadow-2xl"
                  loading="lazy"
                  width="400"
                  height="600"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col justify-center"
              >
                <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
                  {libroContent.description}
                </p>

                <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                  {libroContent.secondDescription}
                </p>

                {libroContent.purchaseUrl && libroContent.purchaseUrl !== "#" && (
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-accent text-primary-foreground w-full md:w-auto text-lg py-6"
                    onClick={() => window.open(libroContent.purchaseUrl, "_blank")}
                  >
                    Acquista Ora
                    <ExternalLink className="ml-2" size={20} />
                  </Button>
                )}
              </motion.div>
            </div>
          </div>

          {/* Sezione Tecniche Pratiche */}
          {libroContent.features && libroContent.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-4xl mx-auto mb-12 bg-card rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="text-primary" size={32} />
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Un ponte tra scienza e pratica
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Non solo teoria: ogni capitolo include tecniche pratiche e percorsi esperienziali:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {libroContent.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent flex-shrink-0 mt-1" size={20} />
                    <p className="text-foreground">{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Perché questo libro è unico */}
          {libroContent.highlights && libroContent.highlights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-4xl mx-auto mb-12 bg-card rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-primary" size={32} />
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Perché questo libro è unico
                </h3>
              </div>
              <div className="space-y-3">
                {libroContent.highlights.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary flex-shrink-0 mt-1" size={20} />
                    <p className="text-foreground">{highlight}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* A chi è rivolto */}
          {libroContent.targetAudience && libroContent.targetAudience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="max-w-4xl mx-auto mb-12 bg-card rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-primary" size={32} />
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Perfetto per
                </h3>
              </div>
              <div className="space-y-3">
                {libroContent.targetAudience.map((audience: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent flex-shrink-0 mt-1" size={20} />
                    <p className="text-foreground">{audience}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Autore e Citazione */}
          {(libroContent.authorBio || libroContent.quote) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 shadow-lg"
            >
              {libroContent.authorBio && (
                <div className="mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    L'autore
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {libroContent.authorBio}
                  </p>
                </div>
              )}
              
              {libroContent.quote && (
                <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-foreground">
                  "{libroContent.quote}"
                </blockquote>
              )}

              <div className="mt-8 text-center">
                <p className="text-xl font-semibold text-primary mb-4">
                  Inizia oggi il tuo viaggio alla scoperta della geometria nascosta della tua mente.
                </p>
                {libroContent.purchaseUrl && libroContent.purchaseUrl !== "#" && (
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-accent text-primary-foreground text-lg px-8 py-6"
                    onClick={() => window.open(libroContent.purchaseUrl, "_blank")}
                  >
                    Acquista il Libro
                    <ExternalLink className="ml-2" size={20} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Libro;