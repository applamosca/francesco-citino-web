import { Link } from "react-router-dom";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, Instagram, Facebook, Phone } from "lucide-react";

const Footer = () => {
  const { data: content } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;

  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <p className="text-sm md:text-base mb-2">
            © {new Date().getFullYear()} Francesco Citino. Tutti i diritti riservati.
          </p>
          <p className="text-xs md:text-sm opacity-80">
            Psicologo • Ricercatore • Autore
          </p>
          
          {/* Separatore */}
          <div className="flex items-center justify-center py-2">
            <div className="h-px bg-primary-foreground/20 flex-1 max-w-xs"></div>
            <span className="px-4 text-xs opacity-60">Seguimi</span>
            <div className="h-px bg-primary-foreground/20 flex-1 max-w-xs"></div>
          </div>

          {/* Social Media Icons */}
          {contattiContent && (
            <div className="flex justify-center items-center gap-6 pt-2">
              <a
                href={`mailto:${contattiContent.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-200"
                aria-label="Email"
              >
                <Mail size={20} className="opacity-80 hover:opacity-100" />
              </a>
              {contattiContent.instagramUrl && (
                <a
                  href={contattiContent.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform duration-200"
                  aria-label="Instagram"
                >
                  <Instagram 
                    size={20} 
                    className="opacity-90 hover:opacity-100 transition-opacity"
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
                  className="hover:scale-110 transition-transform duration-200"
                  aria-label="Facebook"
                >
                  <Facebook 
                    size={20} 
                    className="opacity-90 hover:opacity-100 transition-opacity"
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
                  className="hover:scale-110 transition-transform duration-200"
                  aria-label="WhatsApp"
                >
                  <Phone 
                    size={20} 
                    className="opacity-90 hover:opacity-100 transition-opacity"
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
            className="inline-block mt-4 text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;