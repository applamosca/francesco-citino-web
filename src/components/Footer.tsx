import { Link } from "react-router-dom";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, Instagram, Facebook, Phone } from "lucide-react";

const Footer = () => {
  const { data: content } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;

  return (
    <footer className="bg-primary text-primary-foreground py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 md:space-y-4">
          <p className="text-xs md:text-sm lg:text-base mb-1 md:mb-2">
            © {new Date().getFullYear()} Francesco Citino. Tutti i diritti riservati.
          </p>
          <p className="text-xs md:text-sm opacity-80">
            Psicologo • Ricercatore • Autore
          </p>
          
          {/* Separatore */}
          <div className="flex items-center justify-center py-2 md:py-3">
            <div className="h-px bg-primary-foreground/20 flex-1 max-w-[80px] md:max-w-xs"></div>
            <span className="px-3 md:px-4 text-[10px] md:text-xs opacity-60">Seguimi</span>
            <div className="h-px bg-primary-foreground/20 flex-1 max-w-[80px] md:max-w-xs"></div>
          </div>

          {/* Social Media Icons */}
          {contattiContent && (
            <div className="flex justify-center items-center gap-4 md:gap-6 pt-1 md:pt-2">
              <a
                href={`mailto:${contattiContent.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:scale-110 transition-all duration-300"
                aria-label="Email"
              >
                <Mail 
                  size={18} 
                  className="md:w-5 md:h-5 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" 
                />
              </a>
              {contattiContent.instagramUrl && (
                <a
                  href={contattiContent.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram 
                    size={18}
                    className="md:w-5 md:h-5 opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12"
                    style={{ 
                      color: '#E4405F',
                      filter: 'drop-shadow(0 0 2px rgba(228, 64, 95, 0.5))'
                    }} 
                  />
                </a>
              )}
              {contattiContent.facebookUrl && (
                <a
                  href={contattiContent.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:scale-110 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook 
                    size={18}
                    className="md:w-5 md:h-5 opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:-rotate-12"
                    style={{ 
                      color: '#1877F2',
                      filter: 'drop-shadow(0 0 2px rgba(24, 119, 242, 0.5))'
                    }} 
                  />
                </a>
              )}
              {contattiContent.whatsappUrl && (
                <a
                  href={contattiContent.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:scale-110 transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <Phone 
                    size={18}
                    className="md:w-5 md:h-5 opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12"
                    style={{ 
                      color: '#25D366',
                      filter: 'drop-shadow(0 0 2px rgba(37, 211, 102, 0.5))'
                    }} 
                  />
                </a>
              )}
            </div>
          )}

          <Link 
            to="/admin" 
            className="inline-block mt-3 md:mt-4 text-[10px] md:text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;