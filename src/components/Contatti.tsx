import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import instagramLogo from "@/assets/instagram-logo.png";
import facebookLogo from "@/assets/facebook-logo.png";
import whatsappLogo from "@/assets/whatsapp-logo.png";

const Contatti = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content, isLoading } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;

  if (isLoading || !contattiContent) {
    return <section id="contatti" className="py-20 md:py-32 bg-background" ref={ref} />;
  }

  return (
    <section id="contatti" className="py-20 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-12 text-center">
            Contatti
          </h2>

          <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-xl p-8 md:p-12">
            <p className="text-lg md:text-xl text-center text-muted-foreground mb-12">
              Per informazioni, consulenze o collaborazioni, non esitare a contattarmi
            </p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all duration-300"
                  onClick={() => window.location.href = `mailto:${contattiContent.email}`}
                >
                  <Mail className="mr-3 text-primary" size={24} />
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">{contattiContent.email}</p>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all duration-300"
                  onClick={() => window.open(contattiContent.instagramUrl, "_blank")}
                >
                  <img src={instagramLogo} alt="Instagram" className="mr-3 w-6 h-6" />
                  <div>
                    <p className="font-semibold text-foreground">Instagram</p>
                    <p className="text-muted-foreground">{contattiContent.instagram}</p>
                  </div>
                </Button>
              </motion.div>

              {contattiContent.facebook && contattiContent.facebookUrl && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    onClick={() => window.open(contattiContent.facebookUrl, "_blank")}
                  >
                    <img src={facebookLogo} alt="Facebook" className="mr-3 w-6 h-6" />
                    <div>
                      <p className="font-semibold text-foreground">Facebook</p>
                      <p className="text-muted-foreground">{contattiContent.facebook}</p>
                    </div>
                  </Button>
                </motion.div>
              )}

              {contattiContent.whatsapp && contattiContent.whatsappUrl && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all duration-300"
                    onClick={() => window.open(contattiContent.whatsappUrl, "_blank")}
                  >
                    <img src={whatsappLogo} alt="WhatsApp" className="mr-3 w-6 h-6" />
                    <div>
                      <p className="font-semibold text-foreground">WhatsApp</p>
                      <p className="text-muted-foreground">{contattiContent.whatsapp}</p>
                    </div>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contatti;
