import { motion } from "framer-motion";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  status: string | null;
}

const Blog = () => {
  const ref = useRef(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data non disponibile";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <section
        id="blog"
        className="min-h-screen flex items-center justify-center bg-background"
        ref={ref}
      />
    );
  }

  return (
    <section
      id="blog"
      className="min-h-screen py-20 px-4 bg-gradient-to-b from-background to-muted/20"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Blog
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Articoli, riflessioni e approfondimenti su psicologia, filosofia della mente e ricerca cognitiva
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary/50"
            >
              {post.featured_image && (
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at || undefined}>
                    {formatDate(post.published_at)}
                  </time>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                <Button
                  variant="ghost"
                  className="group/btn p-0 h-auto font-semibold text-primary hover:text-primary/80"
                  asChild
                >
                  <a href={`/blog/${post.slug}`}>
                    Leggi l'articolo
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>

        {(!posts || posts.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nessun articolo pubblicato al momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
