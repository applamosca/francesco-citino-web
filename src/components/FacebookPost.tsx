import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FacebookPostProps {
  postUrl: string;
}

const FacebookPost = ({ postUrl }: FacebookPostProps) => {
  return (
    <section id="facebook-post" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Ultimi Aggiornamenti
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Segui le ultime novità dalla pagina Facebook "Pensiero Perante"
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl w-full shadow-lg">
            {/* Post Image Preview */}
            <div className="aspect-video bg-gradient-to-br from-[#1877F2]/20 to-[#1877F2]/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-24 h-24 text-[#1877F2]/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card/80 to-transparent h-20" />
            </div>
            
            <div className="p-6">
              {/* Page Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pensiero Perante</h3>
                  <p className="text-sm text-muted-foreground">Pagina Facebook</p>
                </div>
              </div>
              
              {/* Post Preview Text */}
              <p className="text-foreground mb-4 line-clamp-3">
                Riflessioni sulla psicologia e il benessere mentale. Scopri l'ultimo contenuto condiviso sulla nostra pagina Facebook, dove esploriamo temi legati alla crescita personale e alla consapevolezza di sé.
              </p>
              
              <p className="text-sm text-muted-foreground mb-6">
                Clicca per leggere il post completo su Facebook
              </p>
              
              <Button
                asChild
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white"
              >
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Leggi il Post Completo
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://www.facebook.com/pensieroperante"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Segui Pensiero Perante su Facebook
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FacebookPost;
