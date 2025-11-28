import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import francescoProfile from "@/assets/francesco-trajinera.jpg";
import { useContent, type ChiSonoContent } from "@/hooks/useContent";

const ChiSonoNew = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content, isLoading } = useContent("chi_sono");
  const chiSonoContent = content as unknown as ChiSonoContent;

  if (isLoading || !chiSonoContent) {
    return (
      <section id="chi-sono" className="py-20 md:py-32 bg-muted/30" ref={ref}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-12 bg-primary/20 rounded-lg w-1/3 mx-auto mb-16 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <div className="aspect-[4/3] lg:aspect-[3/4] bg-muted/50 rounded-3xl animate-pulse" />
              <div className="space-y-6">
                <div className="h-8 bg-primary/10 rounded-lg w-2/3 animate-pulse" />
                <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
                <div className="h-4 bg-muted/50 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-muted/50 rounded w-4/5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="chi-sono" className="py-20 md:py-32 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-16 text-center">
            Chi Sono
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Foto profilo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[3/4]">
                <img
                  src={francescoProfile}
                  alt="Francesco Citino"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </motion.div>

            {/* Contenuto testo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary">Francesco Citino</h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {chiSonoContent.mainText}
                </p>
              </div>

              {/* Approccio */}
              <div className="space-y-4 pt-4">
                <h4 className="text-xl font-semibold text-primary">
                  {chiSonoContent.approachText}
                </h4>
                <ul className="space-y-3">
                  {chiSonoContent.approaches.map((approach, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 text-foreground/80"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{approach}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Obiettivi */}
              <div className="space-y-4 pt-4">
                <h4 className="text-xl font-semibold text-primary">
                  {chiSonoContent.goalText}
                </h4>
                <ul className="space-y-3">
                  {chiSonoContent.goals.map((goal, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-3 text-foreground/80"
                    >
                      <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span>{goal}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Chiusura */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-lg text-foreground/80 leading-relaxed pt-4 italic border-l-4 border-primary pl-4"
              >
                {chiSonoContent.closingText}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChiSonoNew;
