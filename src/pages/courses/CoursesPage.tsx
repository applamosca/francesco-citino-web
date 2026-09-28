import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db, Course } from "@/lib/courses";

const CoursesPage = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await db
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("display_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Torna al sito</Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2">Corsi</h1>
        <p className="text-muted-foreground mb-10">Percorsi video di crescita personale e professionale.</p>

        {isLoading && <p className="text-muted-foreground">Caricamento...</p>}
        {!isLoading && courses.length === 0 && (
          <p className="text-muted-foreground">I corsi saranno disponibili a breve.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((c) => (
            <Link key={c.id} to={`/corsi/${c.slug}`} className="group">
              <Card className="overflow-hidden h-full transition-shadow group-hover:shadow-lg">
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {c.cover_image ? (
                    <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <PlayCircle className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-5">
                  <h2 className="text-xl font-semibold mb-1">{c.title}</h2>
                  {c.subtitle && <p className="text-muted-foreground text-sm mb-3">{c.subtitle}</p>}
                  {c.price != null && <p className="font-semibold">€ {Number(c.price).toFixed(2)}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
