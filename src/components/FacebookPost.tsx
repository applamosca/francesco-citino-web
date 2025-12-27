import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';

interface FacebookPostData {
  id: string;
  message?: string;
  full_picture?: string;
  created_time: string;
  permalink_url: string;
}

const FacebookPost = () => {
  const [post, setPost] = useState<FacebookPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-facebook-posts', {
          body: { limit: 1 }
        });

        if (fnError) {
          console.error('Error fetching Facebook posts:', fnError);
          setError('Impossibile caricare il post');
          return;
        }

        if (data?.posts && data.posts.length > 0) {
          setPost(data.posts[0]);
        } else {
          setError('Nessun post disponibile');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Errore di connessione');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : post ? (
            <a 
              href={post.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-lg w-full bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-border"
            >
              {post.full_picture && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.full_picture} 
                    alt="Post Facebook"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pensiero Perante</p>
                    <p className="text-sm text-muted-foreground">{formatDate(post.created_time)}</p>
                  </div>
                </div>
                {post.message && (
                  <p className="text-foreground line-clamp-4">
                    {post.message}
                  </p>
                )}
              </div>
            </a>
          ) : null}
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
