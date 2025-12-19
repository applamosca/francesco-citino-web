import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AccessLog {
  id: string;
  user_id: string | null;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  failure_reason: string | null;
  is_suspicious: boolean;
  created_at: string;
}

export interface SecurityStats {
  attempts_24h: number;
  successful_24h: number;
  failed_24h: number;
  suspicious_24h: number;
  unique_ips_24h: number;
  attempts_7d: number;
  failed_7d: number;
  suspicious_7d: number;
}

export const useAccessLogs = (limit: number = 50) => {
  return useQuery({
    queryKey: ["access-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AccessLog[];
    },
  });
};

export const useSecurityStats = () => {
  return useQuery({
    queryKey: ["security-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_stats")
        .select("*")
        .single();

      if (error) throw error;
      return data as SecurityStats;
    },
  });
};

export const logAccessAttempt = async (
  email: string,
  success: boolean,
  failureReason?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke("log-access-attempt", {
      body: { email, success, failureReason, userId },
    });

    if (error) {
      console.error("Failed to log access attempt:", error);
    }

    return data;
  } catch (err) {
    console.error("Error calling log-access-attempt:", err);
  }
};
