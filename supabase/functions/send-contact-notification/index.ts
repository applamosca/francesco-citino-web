import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { name, email, message }: ContactNotificationRequest = await req.json();

    console.log("Sending contact notification for:", { name, email });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification to admin
    if (adminEmail) {
      await sendEmail(
        adminEmail,
        `Nuovo messaggio da ${name}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              Nuovo Messaggio dal Sito Web
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            </div>
            
            <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
              <h3 style="color: #495057; margin-top: 0;">Messaggio:</h3>
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
              Questo messaggio è stato inviato dal modulo di contatto del tuo sito web.
            </p>
          </div>
        `
      );
      console.log("Admin notification sent");
    }

    // Send confirmation email to sender
    await sendEmail(
      email,
      "Grazie per avermi contattato!",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a365d; text-align: center; margin-bottom: 30px;">
            Grazie per il tuo messaggio, ${name}!
          </h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Ho ricevuto il tuo messaggio e ti risponderò il prima possibile, solitamente entro 24-48 ore.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1a365d;">
            <h3 style="color: #495057; margin-top: 0; margin-bottom: 10px;">Il tuo messaggio:</h3>
            <p style="color: #666; font-style: italic; white-space: pre-wrap; margin: 0;">${message}</p>
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
