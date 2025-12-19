import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_at: string;
  blocked_by: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export const useBlockedIPs = () => {
  return useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      return data as BlockedIP[];
    },
  });
};

export const useBlockIP = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ip_address, reason }: { ip_address: string; reason?: string }) => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .insert({
          ip_address,
          reason,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast({
        title: "IP bloccato",
        description: "L'indirizzo IP è stato bloccato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message.includes("duplicate") 
          ? "Questo IP è già stato bloccato" 
          : "Impossibile bloccare l'IP",
        variant: "destructive",
      });
    },
  });
};

export const useUnblockIP = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blocked_ips")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast({
        title: "IP sbloccato",
        description: "L'indirizzo IP è stato sbloccato",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile sbloccare l'IP",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBlockedIP = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blocked_ips")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast({
        title: "Record eliminato",
        description: "Il record è stato eliminato",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il record",
        variant: "destructive",
      });
    },
  });
};
