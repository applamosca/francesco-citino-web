import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useContent, type ContattiContent } from "@/hooks/useContent";
import { Mail, Send, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Il nome deve contenere almeno 2 caratteri").max(100, "Il nome deve contenere massimo 100 caratteri"),
  email: z.string().trim().email("Email non valida").max(255, "Email troppo lunga"),
  message: z.string().trim().min(10, "Il messaggio deve contenere almeno 10 caratteri").max(1000, "Il messaggio deve contenere massimo 1000 caratteri")
});

const Contatti = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: content, isLoading } = useContent("contatti");
  const contattiContent = content as unknown as ContattiContent;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      // Validate
      const validated = contactSchema.parse(formData);
      
      setIsSubmitting(true);
      
      // Insert into database with validated data
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: validated.name,
          email: validated.email,
          message: validated.message
        }]);

      if (error) throw error;

      toast({
        title: "Messaggio inviato!",
        description: "Ti risponderò al più presto.",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore. Riprova più tardi.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl shadow-xl p-8 space-y-6"
            >
              <p className="text-lg text-muted-foreground mb-6">
                Per informazioni, consulenze o collaborazioni, non esitare a contattarmi
              </p>

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

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground/70 text-center">
                  Per seguirmi sui social, usa le icone nel footer del sito.
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="mt-6 rounded-xl overflow-hidden shadow-lg border border-border">
                <div className="bg-muted h-48 flex items-center justify-center">
                  <MapPin className="text-muted-foreground" size={48} />
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-semibold text-foreground mb-6">Invia un messaggio</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Textarea
                    placeholder="Il tuo messaggio..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Invio..." : "Invia Messaggio"}
                  <Send className="ml-2" size={18} />
                </Button>
              </form>

              <p className="text-xs text-muted-foreground/70 mt-4 text-center">
                I tuoi dati saranno trattati nel rispetto della privacy.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contatti;
