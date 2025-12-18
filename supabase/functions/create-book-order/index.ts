import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, shipping_address, quantity } = await req.json();

    // Validate required fields
    if (!name || !email || !shipping_address) {
      return new Response(
        JSON.stringify({ error: 'Nome, email e indirizzo di spedizione sono obbligatori' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato email non valido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone format (optional field, but validate if provided)
    if (phone) {
      const phoneRegex = /^[\d\s\-+()]{6,20}$/;
      if (!phoneRegex.test(phone)) {
        return new Response(
          JSON.stringify({ error: 'Formato telefono non valido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate quantity
    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 100) {
      return new Response(
        JSON.stringify({ error: 'Quantità deve essere tra 1 e 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize text fields (strip HTML tags, limit length)
    const sanitize = (str: string, maxLength: number) => 
      str.substring(0, maxLength).replace(/<[^>]*>/g, '').trim();

    const sanitizedName = sanitize(name, 100);
    const sanitizedEmail = sanitize(email, 255);
    const sanitizedPhone = phone ? sanitize(phone, 20) : null;
    const sanitizedAddress = sanitize(shipping_address, 500);

    // Validate sanitized fields are not empty
    if (!sanitizedName || !sanitizedEmail || !sanitizedAddress) {
      return new Response(
        JSON.stringify({ error: 'I campi obbligatori non possono essere vuoti dopo la validazione' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the validated order
    const { data, error } = await supabase
      .from('book_orders')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        shipping_address: sanitizedAddress,
        quantity: qty,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Errore durante la creazione dell\'ordine' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, order: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-book-order:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
