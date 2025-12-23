import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FacebookPostProps {
  postUrl: string;
  width?: number;
}

declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: (element?: HTMLElement) => void;
      };
    };
  }
}

const FacebookPost = ({ postUrl, width = 500 }: FacebookPostProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkLoaded = useRef(false);

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      if (sdkLoaded.current) {
        // If SDK already loaded, just re-parse
        if (window.FB) {
          window.FB.XFBML.parse(containerRef.current || undefined);
        }
        return;
      }

      // Create the fb-root div if it doesn't exist
      if (!document.getElementById('fb-root')) {
        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.appendChild(fbRoot);
      }

      // Load the SDK asynchronously
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/it_IT/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        sdkLoaded.current = true;
        if (window.FB && containerRef.current) {
          window.FB.XFBML.parse(containerRef.current);
        }
      };
      document.body.appendChild(script);
    };

    loadFacebookSDK();
  }, [postUrl]);

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
          ref={containerRef}
        >
          <div 
            className="fb-post" 
            data-href={postUrl}
            data-width={width}
            data-show-text="true"
          />
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
