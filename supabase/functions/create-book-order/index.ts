import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const cleanupRateLimitMap = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
};

const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; resetIn: number } => {
  cleanupRateLimitMap();
  
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, resetIn: entry.resetTime - now };
};

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Dr. Francesco Sartori <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Email send error:", errorData);
    return null;
  }

  return response.json();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';
    
    const rateLimit = checkRateLimit(clientIP);
    
    const rateLimitHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
    };
    
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Troppi ordini. Riprova tra qualche minuto.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { status: 429, headers: rateLimitHeaders }
      );
    }

    const { name, email, phone, shipping_address, quantity } = await req.json();

    // Validate required fields
    if (!name || !email || !shipping_address) {
      return new Response(
        JSON.stringify({ error: 'Nome, email e indirizzo di spedizione sono obbligatori' }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato email non valido' }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (phone) {
      const phoneRegex = /^[\d\s\-+()]{6,20}$/;
      if (!phoneRegex.test(phone)) {
        return new Response(
          JSON.stringify({ error: 'Formato telefono non valido' }),
          { status: 400, headers: rateLimitHeaders }
        );
      }
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 100) {
      return new Response(
        JSON.stringify({ error: 'Quantità deve essere tra 1 e 100' }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const sanitize = (str: string, maxLength: number) => 
      str.substring(0, maxLength).replace(/<[^>]*>/g, '').trim();

    const sanitizedName = sanitize(name, 100);
    const sanitizedEmail = sanitize(email, 255);
    const sanitizedPhone = phone ? sanitize(phone, 20) : null;
    const sanitizedAddress = sanitize(shipping_address, 500);

    if (!sanitizedName || !sanitizedEmail || !sanitizedAddress) {
      return new Response(
        JSON.stringify({ error: 'I campi obbligatori non possono essere vuoti dopo la validazione' }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        { status: 500, headers: rateLimitHeaders }
      );
    }

    console.log(`Order created successfully: ${data.id} from IP: ${clientIP}`);

    // Send confirmation email to buyer
    await sendEmail(
      sanitizedEmail,
      "Conferma ordine libro - Dr. Francesco Sartori",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a365d; text-align: center; margin-bottom: 30px;">
            Grazie per il tuo ordine, ${sanitizedName}!
          </h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Abbiamo ricevuto il tuo ordine e lo stiamo elaborando.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1a365d;">
            <h3 style="color: #495057; margin-top: 0; margin-bottom: 15px;">Riepilogo ordine:</h3>
            <p style="margin: 5px 0;"><strong>Numero ordine:</strong> ${data.id.substring(0, 8).toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Libro:</strong> Geometria dello Spirito</p>
            <p style="margin: 5px 0;"><strong>Quantità:</strong> ${qty}</p>
            <p style="margin: 5px 0;"><strong>Indirizzo di spedizione:</strong><br>${sanitizedAddress.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Riceverai un'email di conferma quando il libro sarà spedito.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Grazie per il tuo acquisto!<br>
            <strong>Dr. Francesco Sartori</strong><br>
            <span style="color: #666;">Psicologo e Psicoterapeuta</span>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Questa è un'email automatica. Per qualsiasi domanda, contattami attraverso il sito.
          </p>
        </div>
      `
    );
    console.log("Order confirmation email sent to buyer");

    // Send notification to admin
    if (adminEmail) {
      await sendEmail(
        adminEmail,
        `Nuovo ordine libro da ${sanitizedName}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
              Nuovo Ordine Libro Ricevuto
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>ID Ordine:</strong> ${data.id}</p>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${sanitizedName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
              ${sanitizedPhone ? `<p style="margin: 5px 0;"><strong>Telefono:</strong> ${sanitizedPhone}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Quantità:</strong> ${qty}</p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
              <h3 style="color: #495057; margin-top: 0;">Indirizzo di spedizione:</h3>
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${sanitizedAddress}</p>
            </div>
            
            <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
              Ordine ricevuto il ${new Date().toLocaleString('it-IT')}
            </p>
          </div>
        `
      );
      console.log("Admin notification sent for order");
    }

    return new Response(
      JSON.stringify({ success: true, order: data }),
      { status: 200, headers: rateLimitHeaders }
    );

  } catch (error) {
    console.error('Error in create-book-order:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
