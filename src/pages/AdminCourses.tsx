import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, Plus, Save, Trash2, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db, Course, Lesson, LessonMedia, slugify, parseChapters, chaptersToText } from "@/lib/courses";

type LessonDraft = Lesson & { media: LessonMedia | null; chaptersText: string };

const AdminCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin, isAdminLoading, loading } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [enrollEmail, setEnrollEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    if (!loading && !isAdminLoading && user && !isAdmin) navigate("/");
  }, [loading, isAdminLoading, user, isAdmin, navigate]);

  const fail = (e: unknown) =>
    toast({ title: "Errore", description: e instanceof Error ? e.message : String((e as any)?.message ?? e), variant: "destructive" });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    enabled: isAdmin,
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await db.from("courses").select("*").order("display_order").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const course = courses.find((c) => c.id === selectedId) ?? null;
  const [draft, setDraft] = useState<Course | null>(null);
  useEffect(() => setDraft(course ? { ...course } : null), [course?.id, course?.title]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: lessons = [], refetch: refetchLessons } = useQuery({
    queryKey: ["admin-lessons", selectedId],
    enabled: !!selectedId,
    queryFn: async (): Promise<LessonDraft[]> => {
      const { data: ls, error } = await db.from("course_lessons").select("*").eq("course_id", selectedId).order("position");
      if (error) throw error;
      const ids = (ls ?? []).map((l: Lesson) => l.id);
      const { data: media } = ids.length
        ? await db.from("course_lesson_media").select("*").in("lesson_id", ids)
        : { data: [] };
      return (ls ?? []).map((l: Lesson) => ({
        ...l,
        media: (media ?? []).find((m: LessonMedia) => m.lesson_id === l.id) ?? null,
        chaptersText: chaptersToText(l.chapters),
      }));
    },
  });
  const [lessonDrafts, setLessonDrafts] = useState<LessonDraft[]>([]);
  useEffect(() => setLessonDrafts(lessons), [lessons]);

  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ["admin-enrollments", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await db.from("course_enrollments").select("*").eq("course_id", selectedId).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const createCourse = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    const { data, error } = await db
      .from("courses")
      .insert({ title: newTitle.trim(), slug: `${slugify(newTitle)}-${Date.now().toString(36).slice(-4)}` })
      .select()
      .single();
    setBusy(false);
    if (error) return fail(error);
    setNewTitle("");
    await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    setSelectedId(data.id);
  };

  const saveCourse = async () => {
    if (!draft) return;
    setBusy(true);
    const { error } = await db
      .from("courses")
      .update({
        title: draft.title,
        slug: slugify(draft.slug || draft.title),
        subtitle: draft.subtitle,
        description: draft.description,
        price: draft.price === null || (draft.price as unknown) === "" ? null : Number(draft.price),
        is_published: draft.is_published,
        cover_image: draft.cover_image,
        display_order: Number(draft.display_order) || 0,
      })
      .eq("id", draft.id);
    setBusy(false);
    if (error) return fail(error);
    toast({ title: "Corso salvato" });
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
  };

  const deleteCourse = async () => {
    if (!course || !confirm(`Eliminare il corso "${course.title}" con tutte le lezioni?`)) return;
    const { error } = await db.from("courses").delete().eq("id", course.id);
    if (error) return fail(error);
    setSelectedId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
  };

  const uploadCover = async (file: File) => {
    if (!draft) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      return fail(new Error("Serve un'immagine di massimo 5 MB"));
    }
    const path = `${draft.id}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
    const { error } = await db.storage.from("course-covers").upload(path, file, { contentType: file.type });
    if (error) return fail(error);
    const { data } = db.storage.from("course-covers").getPublicUrl(path);
    setDraft({ ...draft, cover_image: data.publicUrl });
    toast({ title: "Copertina caricata", description: "Ricorda di salvare il corso" });
  };

  const addLesson = async () => {
    if (!selectedId) return;
    const { error } = await db
      .from("course_lessons")
      .insert({ course_id: selectedId, title: "Nuova lezione", position: lessonDrafts.length });
    if (error) return fail(error);
    refetchLessons();
  };

  const updateLessonDraft = (id: string, patch: Partial<LessonDraft>) =>
    setLessonDrafts((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const updateMediaDraft = (id: string, patch: Partial<LessonMedia>) =>
    setLessonDrafts((ls) =>
      ls.map((l) =>
        l.id === id
          ? {
              ...l,
              media: {
                lesson_id: id,
                video_provider: "bunny",
                video_library_id: null,
                video_id: null,
                captions_url: null,
                ...(l.media ?? {}),
                ...patch,
              },
            }
          : l
      )
    );

  const saveLesson = async (l: LessonDraft) => {
    const { error } = await db
      .from("course_lessons")
      .update({
        title: l.title,
        description: l.description,
        position: Number(l.position) || 0,
        is_preview: l.is_preview,
        chapters: parseChapters(l.chaptersText),
      })
      .eq("id", l.id);
    if (error) return fail(error);
    if (l.media) {
      const { error: mErr } = await db.from("course_lesson_media").upsert({
        lesson_id: l.id,
        video_provider: "bunny",
        video_library_id: l.media.video_library_id?.trim() || null,
        video_id: l.media.video_id?.trim() || null,
        captions_url: l.media.captions_url?.trim() || null,
      });
      if (mErr) return fail(mErr);
    }
    toast({ title: "Lezione salvata" });
    refetchLessons();
  };

  const deleteLesson = async (l: LessonDraft) => {
    if (!confirm(`Eliminare la lezione "${l.title}"?`)) return;
    const { error } = await db.from("course_lessons").delete().eq("id", l.id);
    if (error) return fail(error);
    refetchLessons();
  };

  const enroll = async () => {
    if (!selectedId || !enrollEmail.trim()) return;
    const { data, error } = await db.rpc("admin_enroll_by_email", { _course_id: selectedId, _email: enrollEmail });
    if (error) return fail(error);
    if (data === "utente_non_trovato") {
      return toast({
        title: "Utente non trovato",
        description: "La persona deve prima registrarsi sul sito con questa email.",
        variant: "destructive",
      });
    }
    setEnrollEmail("");
    toast({ title: "Iscrizione attivata" });
    refetchEnrollments();
  };

  const removeEnrollment = async (id: string) => {
    if (!confirm("Rimuovere l'accesso a questo iscritto?")) return;
    const { error } = await db.from("course_enrollments").delete().eq("id", id);
    if (error) return fail(error);
    refetchEnrollments();
  };

  if (loading || isAdminLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento...</div>;
  }
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestione Corsi</h1>
            <p className="text-muted-foreground">Corsi, lezioni video, capitoli e iscritti</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/panel")}>
            <ArrowLeft className="mr-2 h-4 w-4" />Torna al pannello
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Elenco corsi */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Corsi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Titolo nuovo corso" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <Button size="icon" onClick={createCourse} disabled={busy} aria-label="Crea corso"><Plus className="h-4 w-4" /></Button>
              </div>
              <ul className="space-y-1">
                {courses.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left rounded-md px-3 py-2 flex items-center gap-2 hover:bg-muted ${selectedId === c.id ? "bg-muted font-medium" : ""}`}
                    >
                      {c.is_published ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      <span className="flex-1 truncate">{c.title}</span>
                    </button>
                  </li>
                ))}
                {courses.length === 0 && <li className="text-sm text-muted-foreground">Nessun corso ancora.</li>}
              </ul>
            </CardContent>
          </Card>

          {!draft ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">Seleziona o crea un corso.</CardContent></Card>
          ) : (
            <div className="space-y-6">
              {/* Dati corso */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Dati del corso</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pub">Pubblicato</Label>
                    <Switch id="pub" checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Label>Titolo</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
                  <div><Label>Indirizzo (slug)</Label><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
                  <div><Label>Prezzo (€)</Label><Input type="number" step="0.01" value={draft.price ?? ""} onChange={(e) => setDraft({ ...draft, price: e.target.value === "" ? null : Number(e.target.value) })} /></div>
                  <div className="sm:col-span-2"><Label>Sottotitolo</Label><Input value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Label>Descrizione</Label><Textarea rows={5} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
                    {draft.cover_image && <img src={draft.cover_image} alt="" className="h-20 rounded-md object-cover" />}
                    <Label className="inline-flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 hover:bg-muted">
                      <Upload className="h-4 w-4" />Carica copertina
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                    </Label>
                  </div>
                  <div className="sm:col-span-2 flex justify-between">
                    <Button variant="destructive" onClick={deleteCourse}><Trash2 className="mr-2 h-4 w-4" />Elimina corso</Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => window.open(`/corsi/${draft.slug}`, "_blank")}>Anteprima</Button>
                      <Button onClick={saveCourse} disabled={busy}><Save className="mr-2 h-4 w-4" />Salva corso</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lezioni */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Lezioni</CardTitle>
                  <Button size="sm" onClick={addLesson}><Plus className="mr-2 h-4 w-4" />Aggiungi lezione</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {lessonDrafts.length === 0 && <p className="text-muted-foreground text-sm">Nessuna lezione. Aggiungine una.</p>}
                  {lessonDrafts.map((l) => (
                    <div key={l.id} className="rounded-lg border p-4 grid gap-3 sm:grid-cols-6">
                      <div className="sm:col-span-5"><Label>Titolo</Label><Input value={l.title} onChange={(e) => updateLessonDraft(l.id, { title: e.target.value })} /></div>
                      <div><Label>Ordine</Label><Input type="number" value={l.position} onChange={(e) => updateLessonDraft(l.id, { position: Number(e.target.value) })} /></div>
                      <div className="sm:col-span-6"><Label>Descrizione</Label><Textarea rows={2} value={l.description ?? ""} onChange={(e) => updateLessonDraft(l.id, { description: e.target.value })} /></div>
                      <div className="sm:col-span-3"><Label>Bunny Library ID</Label><Input value={l.media?.video_library_id ?? ""} onChange={(e) => updateMediaDraft(l.id, { video_library_id: e.target.value })} placeholder="es. 123456" /></div>
                      <div className="sm:col-span-3"><Label>Bunny Video ID</Label><Input value={l.media?.video_id ?? ""} onChange={(e) => updateMediaDraft(l.id, { video_id: e.target.value })} placeholder="da inserire quando il video è caricato" /></div>
                      <div className="sm:col-span-6">
                        <Label>Capitoli (uno per riga: "00:00 Titolo")</Label>
                        <Textarea rows={4} className="font-mono text-sm" value={l.chaptersText} onChange={(e) => updateLessonDraft(l.id, { chaptersText: e.target.value })} placeholder={"00:00 Introduzione\n03:15 Il primo concetto"} />
                      </div>
                      <div className="sm:col-span-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Switch id={`prev-${l.id}`} checked={l.is_preview} onCheckedChange={(v) => updateLessonDraft(l.id, { is_preview: v })} />
                          <Label htmlFor={`prev-${l.id}`}>Anteprima gratuita</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteLesson(l)}><Trash2 className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => saveLesson(l)}><Save className="mr-2 h-4 w-4" />Salva lezione</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Iscritti */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Iscritti ({enrollments.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input type="email" placeholder="email dell'iscritto (deve essere registrato)" value={enrollEmail} onChange={(e) => setEnrollEmail(e.target.value)} />
                    <Button onClick={enroll}><UserPlus className="mr-2 h-4 w-4" />Iscrivi</Button>
                  </div>
                  <ul className="divide-y rounded-md border">
                    {enrollments.map((en: any) => (
                      <li key={en.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="font-mono truncate">{en.user_id}</span>
                        <span className="text-muted-foreground">{en.source} · {new Date(en.created_at).toLocaleDateString("it-IT")}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeEnrollment(en.id)}><Trash2 className="h-4 w-4" /></Button>
                      </li>
                    ))}
                    {enrollments.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Nessun iscritto.</li>}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
