import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  message: string;
}

// Simple per-IP rate limiting using in-memory map
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const sendEmail = async (to: string, subject: string, html: string) => {
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
    throw new Error(errorData.message || "Failed to send email");
  }

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Troppi messaggi inviati. Riprova tra un minuto." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const { name, email, message } = body as ContactNotificationRequest;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: "Nome non valido (2-100 caratteri)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email non valida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!message || typeof message !== "string" || message.trim().length < 10 || message.trim().length > 1000) {
      return new Response(
        JSON.stringify({ error: "Messaggio non valido (10-1000 caratteri)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Strip HTML tags for safety
    const sanitize = (s: string) => s.replace(/<[^>]*>/g, "").trim();
    const sanitizedName = sanitize(name);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedMessage = sanitize(message);

    // Insert into DB using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      throw new Error("Failed to save message");
    }

    console.log("Contact message saved for:", { name: sanitizedName, email: sanitizedEmail });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      // Message saved, just skip emails
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification to admin
    if (adminEmail) {
      await sendEmail(
        adminEmail,
        `Nuovo messaggio da ${sanitizedName}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              Nuovo Messaggio dal Sito Web
            </h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${sanitizedName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
            </div>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
              <h3 style="color: #495057; margin-top: 0;">Messaggio:</h3>
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${sanitizedMessage}</p>
            </div>
            <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
              Questo messaggio è stato inviato dal modulo di contatto del tuo sito web.
            </p>
          </div>
        `
      );
      console.log("Admin notification sent");
    }

    // Send confirmation to sender
    await sendEmail(
      sanitizedEmail,
      "Grazie per avermi contattato!",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a365d; text-align: center; margin-bottom: 30px;">
            Grazie per il tuo messaggio, ${sanitizedName}!
          </h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Ho ricevuto il tuo messaggio e ti risponderò il prima possibile, solitamente entro 24-48 ore.
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1a365d;">
            <h3 style="color: #495057; margin-top: 0; margin-bottom: 10px;">Il tuo messaggio:</h3>
            <p style="color: #666; font-style: italic; white-space: pre-wrap; margin: 0;">${sanitizedMessage}</p>
          </div>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Nel frattempo, puoi visitare il mio sito per scoprire di più sui miei servizi e il mio approccio terapeutico.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            A presto,<br>
            <strong>Dr. Francesco Sartori</strong><br>
            <span style="color: #666;">Psicologo e Psicoterapeuta</span>
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Questa è un'email automatica. Non rispondere direttamente a questo messaggio.
          </p>
        </div>
      `
    );
    console.log("Confirmation email sent to sender");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
