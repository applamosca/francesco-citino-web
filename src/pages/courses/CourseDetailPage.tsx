import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { db, Course, Lesson, LessonMedia, bunnyEmbedUrl, formatTime } from "@/lib/courses";

const CourseDetailPage = () => {
  const { slug } = useParams();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [start, setStart] = useState(0);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async (): Promise<Course | null> => {
      const { data, error } = await db.from("courses").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["course-lessons", course?.id],
    enabled: !!course,
    queryFn: async (): Promise<Lesson[]> => {
      const { data, error } = await db
        .from("course_lessons")
        .select("*")
        .eq("course_id", course!.id)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: enrolled = false } = useQuery({
    queryKey: ["enrolled", course?.id, user?.id],
    enabled: !!course && !!user,
    queryFn: async () => {
      const { data } = await db
        .from("course_enrollments")
        .select("id")
        .eq("course_id", course!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const canWatchAll = enrolled || isAdmin;
  const active = useMemo(
    () => lessons.find((l) => l.id === activeId) ?? lessons[0] ?? null,
    [lessons, activeId]
  );
  const canWatch = !!active && (canWatchAll || active.is_preview);

  // La RLS restituisce il media solo a iscritti, admin o lezioni in anteprima
  const { data: media } = useQuery({
    queryKey: ["lesson-media", active?.id, user?.id],
    enabled: !!active && canWatch,
    queryFn: async (): Promise<LessonMedia | null> => {
      const { data } = await db.from("course_lesson_media").select("*").eq("lesson_id", active!.id).maybeSingle();
      return data;
    },
  });

  const { data: completed = [] } = useQuery({
    queryKey: ["progress", course?.id, user?.id],
    enabled: !!user && lessons.length > 0,
    queryFn: async (): Promise<string[]> => {
      const { data } = await db
        .from("course_progress")
        .select("lesson_id")
        .in("lesson_id", lessons.map((l) => l.id));
      return (data ?? []).map((r: { lesson_id: string }) => r.lesson_id);
    },
  });

  useEffect(() => setStart(0), [active?.id]);

  const markDone = async () => {
    if (!user || !active) return;
    await db.from("course_progress").upsert({ user_id: user.id, lesson_id: active.id });
    queryClient.invalidateQueries({ queryKey: ["progress", course?.id, user?.id] });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento...</div>;
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Corso non trovato.</p>
        <Button asChild variant="outline"><Link to="/corsi">Tutti i corsi</Link></Button>
      </div>
    );
  }

  const embed = media ? bunnyEmbedUrl(media, start) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/corsi"><ArrowLeft className="mr-2 h-4 w-4" />Tutti i corsi</Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
        {course.subtitle && <p className="text-muted-foreground mb-8">{course.subtitle}</p>}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {canWatch && embed ? (
                <iframe
                  key={`${active?.id}-${start}`}
                  src={embed}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={active?.title}
                />
              ) : canWatch ? (
                <p className="text-muted-foreground p-6 text-center">Video in preparazione.</p>
              ) : (
                <div className="text-center p-6">
                  <Lock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="mb-4">Questa lezione è riservata agli iscritti al corso.</p>
                  {!user ? (
                    <Button asChild><Link to="/auth">Accedi</Link></Button>
                  ) : (
                    <Button asChild><Link to="/#contatti">Richiedi l'accesso</Link></Button>
                  )}
                </div>
              )}
            </div>

            {active && (
              <div className="mt-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-semibold">{active.title}</h2>
                  {user && canWatch && (
                    <Button variant="outline" size="sm" onClick={markDone} disabled={completed.includes(active.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {completed.includes(active.id) ? "Completata" : "Segna come completata"}
                    </Button>
                  )}
                </div>
                {active.description && <p className="text-muted-foreground mt-3 whitespace-pre-line">{active.description}</p>}

                {canWatch && active.chapters?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Capitoli</h3>
                    <ul className="divide-y rounded-md border">
                      {active.chapters.map((ch, i) => (
                        <li key={i}>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-muted flex gap-3"
                            onClick={() => setStart(ch.start)}
                          >
                            <span className="font-mono text-sm text-primary w-16 shrink-0">{formatTime(ch.start)}</span>
                            <span>{ch.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {course.description && (
              <div className="mt-10">
                <h3 className="font-semibold mb-2">Il corso</h3>
                <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
              </div>
            )}
          </div>

          <aside>
            <h3 className="font-semibold mb-3">Lezioni</h3>
            <ul className="space-y-2">
              {lessons.map((l, i) => {
                const unlocked = canWatchAll || l.is_preview;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveId(l.id)}
                      className={`w-full text-left rounded-md border px-3 py-2 flex items-center gap-3 hover:bg-muted ${
                        active?.id === l.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      {completed.includes(l.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      ) : unlocked ? (
                        <PlayCircle className="h-4 w-4 shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="flex-1">{i + 1}. {l.title}</span>
                      {l.is_preview && !canWatchAll && <span className="text-xs text-primary">Gratis</span>}
                    </button>
                  </li>
                );
              })}
              {lessons.length === 0 && <li className="text-muted-foreground text-sm">Lezioni in arrivo.</li>}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
