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
          
          {/* Social Media Icons */}
          {contattiContent && (
            <div className="flex justify-center items-center gap-4 pt-2">
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
                  <Instagram size={20} className="opacity-80 hover:opacity-100" />
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
                  <Facebook size={20} className="opacity-80 hover:opacity-100" />
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
                  <Phone size={20} className="opacity-80 hover:opacity-100" />
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