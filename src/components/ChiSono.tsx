import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useContent, type ChiSonoContent } from "@/hooks/useContent";

const ChiSono = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content, isLoading } = useContent("chi_sono");
  const chiSonoContent = content as unknown as ChiSonoContent;

  if (isLoading || !chiSonoContent) {
    return <section id="chi-sono" className="py-20 md:py-32 bg-bg-soft" ref={ref} />;
  }

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
              {chiSonoContent.mainText}
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
                  {chiSonoContent.approachText}
                </p>
                <ul className="space-y-2 text-base md:text-lg text-muted-foreground ml-4">
                  {chiSonoContent.approaches.map((approach: string, index: number) => (
                    <li key={index}>• <strong>{approach.split(" ")[0]} {approach.split(" ")[1]}</strong> {approach.split(" ").slice(2).join(" ")}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-base md:text-lg text-muted-foreground mb-4">
                  {chiSonoContent.goalText}
                </p>
                <ul className="space-y-2 text-base md:text-lg text-muted-foreground ml-4">
                  {chiSonoContent.goals.map((goal: string, index: number) => (
                    <li key={index}>• <strong>{goal.split(" ").slice(0, 4).join(" ")}</strong> {goal.split(" ").slice(4).join(" ")}</li>
                  ))}
                </ul>
              </div>

              <p className="text-base md:text-lg text-muted-foreground pt-6 italic">
                {chiSonoContent.closingText}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChiSono;
