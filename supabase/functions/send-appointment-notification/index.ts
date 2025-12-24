import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentNotificationRequest {
  email: string;
  name: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "confirmed" | "cancelled" | "deleted";
}

const getEmailContent = (data: AppointmentNotificationRequest) => {
  const { name, serviceName, appointmentDate, appointmentTime, status } = data;

  if (status === "confirmed") {
    return {
      subject: "✅ Appuntamento Confermato",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appuntamento Confermato</h1>
            </div>
            <div class="content">
              <p>Ciao <strong>${name}</strong>,</p>
              <p>Il tuo appuntamento è stato <strong>confermato</strong>!</p>
              <div class="details">
                <p><strong>📋 Servizio:</strong> ${serviceName}</p>
                <p><strong>📅 Data:</strong> ${appointmentDate}</p>
                <p><strong>🕐 Ora:</strong> ${appointmentTime}</p>
              </div>
              <p>Ti aspettiamo! Se hai bisogno di modificare o cancellare l'appuntamento, contattaci.</p>
            </div>
            <div class="footer">
              <p>Dr. Francesco Tredicine - Psicologo</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  } else if (status === "cancelled") {
    return {
      subject: "❌ Appuntamento Cancellato",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appuntamento Cancellato</h1>
            </div>
            <div class="content">
              <p>Ciao <strong>${name}</strong>,</p>
              <p>Il tuo appuntamento è stato <strong>cancellato</strong>.</p>
              <div class="details">
                <p><strong>📋 Servizio:</strong> ${serviceName}</p>
                <p><strong>📅 Data:</strong> ${appointmentDate}</p>
                <p><strong>🕐 Ora:</strong> ${appointmentTime}</p>
              </div>
              <p>Se desideri prenotare un nuovo appuntamento, visita il nostro sito.</p>
            </div>
            <div class="footer">
              <p>Dr. Francesco Tredicine - Psicologo</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  } else {
    return {
      subject: "🗑️ Appuntamento Eliminato",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appuntamento Eliminato</h1>
            </div>
            <div class="content">
              <p>Ciao <strong>${name}</strong>,</p>
              <p>Il tuo appuntamento è stato <strong>eliminato</strong> dal sistema.</p>
              <div class="details">
                <p><strong>📋 Servizio:</strong> ${serviceName}</p>
                <p><strong>📅 Data:</strong> ${appointmentDate}</p>
                <p><strong>🕐 Ora:</strong> ${appointmentTime}</p>
              </div>
              <p>Se hai domande, non esitare a contattarci.</p>
            </div>
            <div class="footer">
              <p>Dr. Francesco Tredicine - Psicologo</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-appointment-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AppointmentNotificationRequest = await req.json();
    console.log("Received notification request:", data);

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "Prenotazioni <onboarding@resend.dev>",
      to: [data.email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
