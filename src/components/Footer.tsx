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
    <footer className="bg-background text-foreground py-10 mt-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Social Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Seguimi</h3>
            {contattiContent && (
              <div className="flex items-center gap-5 text-3xl">
                <a
                  href={`mailto:${contattiContent.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-110"
                  aria-label="Email"
                >
                  <Mail />
                </a>
                {contattiContent.facebookUrl && (
                  <a
                    href={contattiContent.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1877F2] transition-all duration-300 transform hover:scale-110"
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
                    className="text-muted-foreground hover:text-[#E4405F] transition-all duration-300 transform hover:scale-110"
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
                    className="text-muted-foreground hover:text-[#25D366] transition-all duration-300 transform hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Copyright and Stats Section */}
          <div className="flex flex-col items-start md:items-end justify-center gap-3">
            <div className="text-sm">
              © {new Date().getFullYear()} Francesco Citino. Tutti i diritti riservati.
            </div>
            
            {/* Visit Counter */}
            {!isLoading && totalVisits > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;