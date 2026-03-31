
CREATE OR REPLACE FUNCTION public.decrement_book_stock(book_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_rows integer;
BEGIN
  UPDATE public.books
  SET stock_physic = stock_physic - 1, updated_at = now()
  WHERE id = book_id AND stock_physic > 0;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;
