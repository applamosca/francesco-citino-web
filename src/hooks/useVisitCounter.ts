import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVisitCounter = () => {
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const incrementAndFetch = async () => {
      try {
        // Check if we've already counted this visit in this session
        const hasVisited = sessionStorage.getItem("visit_counted");
        
        if (!hasVisited) {
          // Increment visit count
          await supabase.rpc("increment_visit_count");
          sessionStorage.setItem("visit_counted", "true");
        }

        // Fetch total visits
        const { data, error } = await supabase
          .from("site_visits")
          .select("visit_count");

        if (error) throw error;

        // Sum all visit counts
        const total = data?.reduce((sum, row) => sum + row.visit_count, 0) || 0;
        setTotalVisits(total);
      } catch (error) {
        console.error("Error with visit counter:", error);
      } finally {
        setIsLoading(false);
      }
    };

    incrementAndFetch();
  }, []);

  return { totalVisits, isLoading };
};
