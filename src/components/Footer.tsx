import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, Eye } from "lucide-react";
import { FaFacebookSquare, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useVisitCounter } from "@/hooks/useVisitCounter";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => {
  const { data: content } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;
  const { totalVisits, isLoading } = useVisitCounter();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayCount, setDisplayCount] = useState(0);

  // Counting animation
  useEffect(() => {
    if (isInView && totalVisits > 0 && !isLoading) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = totalVisits / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= totalVisits) {
          setDisplayCount(totalVisits);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, totalVisits, isLoading]);

  return (
    <footer ref={ref} className="bg-background text-foreground py-10 mt-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Social Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Seguimi</h3>
            {contattiContent && (
              <TooltipProvider>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-5 text-3xl"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.a
                        href={`mailto:${contattiContent.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-all duration-300"
                        aria-label="Email"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Mail />
                      </motion.a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email</p>
                    </TooltipContent>
                  </Tooltip>

                  {contattiContent.facebookUrl && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.a
                          href={contattiContent.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-[#1877F2] transition-all duration-300"
                          aria-label="Facebook"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaFacebookSquare />
                        </motion.a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Facebook</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {contattiContent.instagramUrl && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.a
                          href={contattiContent.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-[#E4405F] transition-all duration-300"
                          aria-label="Instagram"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaInstagram />
                        </motion.a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Instagram</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {contattiContent.whatsappUrl && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.a
                          href={contattiContent.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-[#25D366] transition-all duration-300"
                          aria-label="WhatsApp"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaWhatsapp />
                        </motion.a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>WhatsApp</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </motion.div>
              </TooltipProvider>
            )}
          </div>

          {/* Copyright and Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-start md:items-end justify-center gap-3"
          >
            <div className="text-sm">
              © {new Date().getFullYear()} Francesco Citino. Tutti i diritti riservati.
            </div>
            
            {/* Visit Counter with Counting Animation */}
            {!isLoading && totalVisits > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Eye size={16} />
                </motion.div>
                <span className="font-mono">
                  {displayCount.toLocaleString()} visite
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;