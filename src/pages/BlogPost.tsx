import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*, blog_categories(name, slug)")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data non disponibile";
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/#blog">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Torna al Blog
            </Link>
          </Button>

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted/40 rounded w-3/4" />
              <div className="h-4 bg-muted/30 rounded w-1/4" />
              <div className="h-64 bg-muted/30 rounded-xl mt-6" />
              <div className="space-y-2 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-muted/20 rounded w-full" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-destructive mb-2">
                Errore nel caricamento
              </h1>
              <p className="text-muted-foreground">
                Si è verificato un errore. Riprova più tardi.
              </p>
            </div>
          )}

          {!isLoading && !error && !post && (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Articolo non trovato
              </h1>
              <p className="text-muted-foreground mb-6">
                L'articolo che cerchi non esiste o non è più disponibile.
              </p>
              <Button asChild>
                <Link to="/#blog">Torna al Blog</Link>
              </Button>
            </div>
          )}

          {post && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at || undefined}>
                  {formatDate(post.published_at)}
                </time>
                {post.blog_categories && (
                  <>
                    <span>·</span>
                    <span>{(post.blog_categories as any).name}</span>
                  </>
                )}
              </div>

              {post.featured_image && (
                <div className="rounded-xl overflow-hidden mb-8">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              <div
                className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </motion.article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
