import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccessLogRequest {
  email: string;
  success: boolean;
  failureReason?: string;
  userId?: string;
}

// Suspicious activity detection thresholds
const FAILED_ATTEMPTS_THRESHOLD = 5; // Failed attempts in time window
const TIME_WINDOW_MINUTES = 15; // Time window for counting attempts

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, success, failureReason, userId }: AccessLogRequest = await req.json();

    // Get client IP and user agent
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("cf-connecting-ip") || 
                      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    console.log(`Access attempt: email=${email}, success=${success}, ip=${ipAddress}`);

    // Check for suspicious activity (multiple failed attempts from same email or IP)
    const timeWindowStart = new Date(Date.now() - TIME_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { data: recentFailures, error: queryError } = await supabase
      .from("access_logs")
      .select("id")
      .eq("success", false)
      .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
      .gte("created_at", timeWindowStart);

    if (queryError) {
      console.error("Error checking recent failures:", queryError);
    }

    const failedCount = (recentFailures?.length || 0) + (success ? 0 : 1);
    const isSuspicious = failedCount >= FAILED_ATTEMPTS_THRESHOLD;

    // Insert access log
    const { error: insertError } = await supabase
      .from("access_logs")
      .insert({
        user_id: userId || null,
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        failure_reason: failureReason || null,
        is_suspicious: isSuspicious,
      });

    if (insertError) {
      console.error("Error inserting access log:", insertError);
      throw new Error("Failed to log access attempt");
    }

    // Send email notification for suspicious activity
    if (isSuspicious && resendApiKey && adminEmail) {
      console.log(`Suspicious activity detected for ${email} - sending notification`);
      
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">⚠️ Avviso di Sicurezza</h1>
            <p>È stata rilevata un'attività sospetta sul tuo sito:</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0 0;"><strong>Indirizzo IP:</strong> ${ipAddress}</p>
              <p style="margin: 8px 0 0;"><strong>Tentativi falliti:</strong> ${failedCount} negli ultimi ${TIME_WINDOW_MINUTES} minuti</p>
              <p style="margin: 8px 0 0;"><strong>Motivo ultimo fallimento:</strong> ${failureReason || "Non specificato"}</p>
              <p style="margin: 8px 0 0;"><strong>Data/Ora:</strong> ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</p>
            </div>
            
            <p>Questo potrebbe indicare un tentativo di accesso non autorizzato. Ti consigliamo di:</p>
            <ul>
              <li>Verificare i log di accesso nella dashboard admin</li>
              <li>Considerare il blocco dell'IP se necessario</li>
              <li>Verificare che le credenziali non siano state compromesse</li>
            </ul>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Questo messaggio è stato generato automaticamente dal sistema di sicurezza.
            </p>
          </div>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Security Alert <onboarding@resend.dev>",
            to: [adminEmail],
            subject: "⚠️ Tentativo di accesso sospetto rilevato",
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error("Failed to send security notification:", errorData);
        } else {
          console.log("Security notification email sent successfully");
        }
      } catch (emailError) {
        console.error("Failed to send security notification email:", emailError);
        // Don't throw - logging should still succeed even if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        isSuspicious,
        message: isSuspicious ? "Suspicious activity detected" : "Access logged"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in log-access-attempt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
