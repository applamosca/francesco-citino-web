import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, Eye } from "lucide-react";
import { FaFacebookSquare, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useVisitCounter } from "@/hooks/useVisitCounter";
import { motion } from "framer-motion";

const Footer = () => {
  const { data: content } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;
  const { totalVisits, isLoading } = useVisitCounter();

  return (
    <footer className="sticky bottom-0 md:static bg-background/95 md:bg-background backdrop-blur-sm md:backdrop-blur-none text-foreground border-t border-border/40 py-4 md:py-8 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 md:space-y-4">
          <p className="hidden md:block text-xs md:text-sm lg:text-base mb-1 md:mb-2">
            © {new Date().getFullYear()} Francesco Citino. Tutti i diritti riservati.
          </p>
          <p className="hidden md:block text-xs md:text-sm text-muted-foreground">
            Psicologo • Ricercatore • Autore
          </p>
          
          {/* Frase invito social - visibile sempre */}
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Seguimi sui social per aggiornamenti e contenuti
          </p>

          {/* Visit Counter with Animation */}
          {!isLoading && totalVisits > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Eye size={14} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {totalVisits.toLocaleString()} visite
              </motion.span>
            </motion.div>
          )}

          {/* Social Media Icons con react-icons */}
          {contattiContent && (
            <div className="flex justify-center items-center gap-4 md:gap-6 pt-1">
              <a
                href={`mailto:${contattiContent.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl md:text-3xl text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-110"
                aria-label="Email"
              >
                <Mail size={28} className="md:w-8 md:h-8" />
              </a>
              {contattiContent.facebookUrl && (
                <a
                  href={contattiContent.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl md:text-3xl text-muted-foreground hover:text-[#1877F2] transition-all duration-300 transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebookSquare />
                </a>
              )}
              {contattiContent.instagramUrl && (
                <a
                  href={contattiContent.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl md:text-3xl text-muted-foreground hover:text-[#E4405F] transition-all duration-300 transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {contattiContent.whatsappUrl && (
                <a
                  href={contattiContent.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl md:text-3xl text-muted-foreground hover:text-[#25D366] transition-all duration-300 transform hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
              )}
            </div>
          )}

          {/* Copyright compatto per mobile */}
          <p className="md:hidden text-[10px] text-muted-foreground/70 pt-1">
            © {new Date().getFullYear()} Francesco Citino
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;