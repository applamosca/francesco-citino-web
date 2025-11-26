import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroContent {
  title: string;
  subtitle: string;
}

export interface ChiSonoContent {
  mainText: string;
  approachText: string;
  approaches: string[];
  goalText: string;
  goals: string[];
  closingText: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface ServiziContent {
  services: ServiceItem[];
}

export interface LibroContent {
  title: string;
  subtitle: string;
  description: string;
  secondDescription: string;
  purchaseUrl: string;
}

export interface ContattiContent {
  email: string;
  instagram: string;
  instagramUrl: string;
}

export const useContent = (section: string) => {
  return useQuery({
    queryKey: ["content", section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", section)
        .single();

      if (error) throw error;
      return data.content;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, content }: { section: string; content: any }) => {
      const { data, error } = await supabase
        .from("site_content")
        .update({ content })
        .eq("section", section)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content", variables.section] });
    },
  });
};