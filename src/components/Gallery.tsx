import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
}

const Gallery = () => {
  const { data: photos, isLoading } = useQuery({
    queryKey: ["gallery-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as GalleryPhoto[];
    },
  });

  if (isLoading) {
    return (
      <section
        id="galleria"
        className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 bg-primary/20 rounded-lg w-1/4 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-muted/30 rounded-lg w-1/2 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <section
      id="galleria"
      className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Galleria
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Momenti e immagini dal mio percorso professionale
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <img
                src={photo.image_url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="text-white/80 text-sm line-clamp-3">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
