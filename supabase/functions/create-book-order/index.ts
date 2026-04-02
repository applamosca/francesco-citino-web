import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const cleanupRateLimitMap = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) rateLimitMap.delete(key);
  }
};

const checkRateLimit = (ip: string) => {
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

interface EmailLogEntry {
  recipient_email: string;
  subject: string;
  email_type: string;
  status: string;
  error_message?: string;
  related_order_id?: string;
}

const logEmail = async (supabase: any, entry: EmailLogEntry) => {
  const { error } = await supabase.from('email_logs').insert(entry);
  if (error) console.error('Failed to log email:', error);
};

const sendEmail = async (
  supabase: any,
  to: string,
  subject: string,
  html: string,
  emailType: string,
  orderId: string
): Promise<boolean> => {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    await logEmail(supabase, {
      recipient_email: to,
      subject,
      email_type: emailType,
      status: 'skipped',
      error_message: 'RESEND_API_KEY not configured',
      related_order_id: orderId,
    });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dr. Francesco Citino <noreply@francescocitino.it>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = JSON.stringify(errorData);
      console.error(`Email send error (${emailType}):`, errorData);
      await logEmail(supabase, {
        recipient_email: to,
        subject,
        email_type: emailType,
        status: 'failed',
        error_message: errorMsg,
        related_order_id: orderId,
      });
      return false;
    }

    await logEmail(supabase, {
      recipient_email: to,
      subject,
      email_type: emailType,
      status: 'sent',
      related_order_id: orderId,
    });
    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Email exception (${emailType}):`, errorMsg);
    await logEmail(supabase, {
      recipient_email: to,
      subject,
      email_type: emailType,
      status: 'failed',
      error_message: errorMsg,
      related_order_id: orderId,
    });
    return false;
  }
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
      return new Response(
        JSON.stringify({ error: 'Troppi ordini. Riprova tra qualche minuto.' }),
        { status: 429, headers: rateLimitHeaders }
      );
    }

    const { name, email, phone, shipping_address, quantity, paypal_transaction_id, book_id } = await req.json();

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
    const sanitizedPaypalId = paypal_transaction_id ? sanitize(paypal_transaction_id, 100) : null;

    if (!sanitizedName || !sanitizedEmail || !sanitizedAddress) {
      return new Response(
        JSON.stringify({ error: 'I campi obbligatori non possono essere vuoti dopo la validazione' }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const orderStatus = sanitizedPaypalId ? 'completed' : 'pending';

    const { data, error } = await supabase
      .from('book_orders')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        shipping_address: sanitizedAddress,
        quantity: qty,
        status: orderStatus,
        paypal_transaction_id: sanitizedPaypalId,
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

    // Decrement stock
    if (book_id && sanitizedPaypalId) {
      const { data: stockResult, error: stockError } = await supabase
        .rpc('decrement_book_stock', { book_id });
      if (stockError) console.error('Stock decrement error:', stockError);
      else if (!stockResult) console.warn('Stock could not be decremented (possibly out of stock)');
    }

    console.log(`Order created: ${data.id}, status: ${orderStatus}, IP: ${clientIP}`);

    const orderRef = data.id.substring(0, 8).toUpperCase();

    // ── Email 1: Ricevuta al cliente ──
    const clientSubject = 'Conferma ricezione ordine: La Geometria Segreta della Mente';
    const clientHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f6f9;">
        <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7a 100%); padding: 30px 25px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Ordine Confermato ✓</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px 25px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">
            Gentile <strong>${sanitizedName}</strong>,
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Grazie per aver acquistato <em>La Geometria Segreta della Mente</em>. Il tuo ordine è stato ricevuto e verrà elaborato a breve.
          </p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1a365d;">
            <h3 style="color: #1a365d; margin: 0 0 15px; font-size: 16px;">📦 Riepilogo Ordine</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Rif. Ordine</td><td style="padding: 6px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">#${orderRef}</td></tr>
              <tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Libro</td><td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">La Geometria Segreta della Mente</td></tr>
              <tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Quantità</td><td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${qty}</td></tr>
              ${sanitizedPaypalId ? `<tr><td style="padding: 6px 0; color: #666; font-size: 14px;">Transazione PayPal</td><td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right; word-break: break-all;">${sanitizedPaypalId}</td></tr>` : ''}
            </table>
          </div>

          <div style="background-color: #f0f7ff; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1a365d; margin: 0 0 8px; font-size: 14px;">🏠 Indirizzo di spedizione</h4>
            <p style="color: #333; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${sanitizedAddress}</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Riceverai un'email di conferma quando il libro sarà spedito.
          </p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
          <p style="color: #333; font-size: 15px; line-height: 1.6; margin-bottom: 0;">
            Cordiali saluti,<br>
            <strong>Dr. Francesco Citino</strong><br>
            <span style="color: #666; font-size: 13px;">Psicologo e Psicoterapeuta</span>
          </p>
        </div>
        <div style="background-color: #f4f6f9; padding: 15px 25px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #999; font-size: 11px; margin: 0;">Questa è un'email automatica generata dal sistema.</p>
        </div>
      </div>
    `;

    // ── Email 2: Notifica operativa al Dott. Citino ──
    const adminSubject = 'NUOVO ORDINE: La Geometria Segreta della Mente';
    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; padding: 20px 25px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 20px;">🛒 Nuovo Ordine Ricevuto</h2>
        </div>
        <div style="background-color: #ffffff; padding: 25px; border: 1px solid #dee2e6; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600; width: 140px;">ID Ordine</td>
              <td style="padding: 12px 8px; color: #333; font-size: 14px;">${data.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600;">Nome</td>
              <td style="padding: 12px 8px; color: #333; font-size: 14px;">${sanitizedName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600;">Email</td>
              <td style="padding: 12px 8px; color: #333; font-size: 14px;"><a href="mailto:${sanitizedEmail}" style="color: #007bff;">${sanitizedEmail}</a></td>
            </tr>
            ${sanitizedPhone ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600;">Telefono</td><td style="padding: 12px 8px; color: #333; font-size: 14px;">${sanitizedPhone}</td></tr>` : ''}
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600;">Quantità</td>
              <td style="padding: 12px 8px; color: #333; font-size: 14px;">${qty}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600;">Stato</td>
              <td style="padding: 12px 8px; color: #333; font-size: 14px;">${orderStatus === 'completed' ? '✅ Pagato' : '⏳ In attesa'}</td>
            </tr>
            ${sanitizedPaypalId ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 12px 8px; color: #666; font-size: 14px; font-weight: 600;">PayPal ID</td><td style="padding: 12px 8px; color: #333; font-size: 14px; word-break: break-all;">${sanitizedPaypalId}</td></tr>` : ''}
          </table>

          <div style="background-color: #fff3cd; padding: 15px 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 8px; font-size: 15px;">📬 Indirizzo di Spedizione</h3>
            <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${sanitizedAddress}</p>
          </div>

          <p style="color: #6c757d; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
            Ordine ricevuto il ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}
          </p>
        </div>
      </div>
    `;

    // Send both emails independently — one failure doesn't block the other
    const [clientResult, adminResult] = await Promise.allSettled([
      sendEmail(supabase, sanitizedEmail, clientSubject, clientHtml, 'order_receipt_client', data.id),
      adminEmail
        ? sendEmail(supabase, adminEmail, adminSubject, adminHtml, 'order_notification_admin', data.id)
        : Promise.resolve(false),
    ]);

    console.log(`Emails sent — client: ${clientResult.status}, admin: ${adminResult.status}`);

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
