import { supabase } from "@/integrations/supabase/client";

// Le tabelle dei corsi non sono ancora nei tipi generati: client non tipizzato solo per queste query.
export const db = supabase as any;

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image: string | null;
  price: number | null;
  is_published: boolean;
  display_order: number;
}

export interface Chapter {
  start: number; // secondi
  title: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  duration_seconds: number | null;
  chapters: Chapter[];
  is_preview: boolean;
}

export interface LessonMedia {
  lesson_id: string;
  video_provider: string;
  video_library_id: string | null;
  video_id: string | null;
  captions_url: string | null;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const formatTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(s).padStart(2, "0")}`;
};

// "00:00 Introduzione" per riga  ->  [{start, title}]
export const parseChapters = (text: string): Chapter[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\d{1,2}(?::\d{1,2}){1,2})\s+(.+)$/);
      if (!m) return null;
      const parts = m[1].split(":").map(Number);
      const start = parts.reduce((acc, n) => acc * 60 + n, 0);
      return { start, title: m[2].trim() };
    })
    .filter((c): c is Chapter => c !== null)
    .sort((a, b) => a.start - b.start);

export const chaptersToText = (chapters: Chapter[]) =>
  (chapters ?? []).map((c) => `${formatTime(c.start)} ${c.title}`).join("\n");

export const bunnyEmbedUrl = (media: LessonMedia, startSeconds = 0) => {
  if (!media.video_library_id || !media.video_id) return null;
  const params = new URLSearchParams({ autoplay: "false", preload: "true", responsive: "true" });
  if (startSeconds > 0) params.set("t", String(startSeconds));
  return `https://iframe.mediadelivery.net/embed/${media.video_library_id}/${media.video_id}?${params}`;
};
