import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Book {
  id: string;
  title: string;
  stock_physic: number;
  amazon_ebook_url: string;
}

export const useBookStock = () => {
  return useQuery({
    queryKey: ["book-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books" as any)
        .select("id, title, stock_physic, amazon_ebook_url")
        .single();

      if (error) throw error;
      return data as unknown as Book;
    },
    refetchInterval: 30000, // refresh every 30s
  });
};

export const useDecrementStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data, error } = await supabase.rpc("decrement_book_stock" as any, {
        book_id: bookId,
      });
      if (error) throw error;
      return data as unknown as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-stock"] });
    },
  });
};
