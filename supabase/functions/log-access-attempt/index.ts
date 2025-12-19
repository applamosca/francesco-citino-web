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

// Rate limiting thresholds
const RATE_LIMIT_ATTEMPTS = 10; // Max attempts before blocking
const RATE_LIMIT_WINDOW_MINUTES = 30; // Rate limit window
const BLOCK_DURATION_MINUTES = 60; // Block duration

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

    // Check if IP is blocked
    const { data: blockedIP } = await supabase
      .from("blocked_ips")
      .select("id")
      .eq("ip_address", ipAddress)
      .eq("is_active", true)
      .single();

    if (blockedIP) {
      console.log(`Blocked IP attempted access: ${ipAddress}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          blocked: true,
          message: "IP address is blocked"
        }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting check
    const rateLimitIdentifier = ipAddress !== "unknown" ? ipAddress : email;
    const { data: rateLimit } = await supabase
      .from("login_rate_limits")
      .select("*")
      .eq("identifier", rateLimitIdentifier)
      .single();

    const now = new Date();
    
    if (rateLimit) {
      // Check if currently blocked
      if (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > now) {
        const blockedUntil = new Date(rateLimit.blocked_until);
        const minutesRemaining = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000);
        
        console.log(`Rate limited: ${rateLimitIdentifier}, blocked for ${minutesRemaining} more minutes`);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            rateLimited: true,
            message: `Troppi tentativi. Riprova tra ${minutesRemaining} minuti.`
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if window has expired
      const windowStart = new Date(rateLimit.first_attempt_at);
      const windowExpiry = new Date(windowStart.getTime() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

      if (now > windowExpiry) {
        // Reset the counter
        await supabase
          .from("login_rate_limits")
          .update({
            attempt_count: 1,
            first_attempt_at: now.toISOString(),
            last_attempt_at: now.toISOString(),
            blocked_until: null,
          })
          .eq("id", rateLimit.id);
      } else {
        // Increment counter
        const newCount = rateLimit.attempt_count + 1;
        const shouldBlock = newCount >= RATE_LIMIT_ATTEMPTS && !success;
        const blockedUntil = shouldBlock 
          ? new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000).toISOString()
          : null;

        await supabase
          .from("login_rate_limits")
          .update({
            attempt_count: newCount,
            last_attempt_at: now.toISOString(),
            blocked_until: blockedUntil,
          })
          .eq("id", rateLimit.id);

        // If blocked, also add to blocked_ips for persistent blocking
        if (shouldBlock && ipAddress !== "unknown") {
          const { error: blockError } = await supabase
            .from("blocked_ips")
            .upsert({
              ip_address: ipAddress,
              reason: `Rate limit exceeded: ${newCount} attempts in ${RATE_LIMIT_WINDOW_MINUTES} minutes`,
              is_active: true,
              expires_at: blockedUntil,
            }, { onConflict: "ip_address" });

          if (!blockError) {
            console.log(`IP auto-blocked due to rate limiting: ${ipAddress}`);
          }
        }

        if (shouldBlock) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              rateLimited: true,
              message: `Troppi tentativi. Riprova tra ${BLOCK_DURATION_MINUTES} minuti.`
            }),
            { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    } else {
      // Create new rate limit record
      await supabase
        .from("login_rate_limits")
        .insert({
          identifier: rateLimitIdentifier,
          attempt_count: 1,
          first_attempt_at: now.toISOString(),
          last_attempt_at: now.toISOString(),
        });
    }

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

    // Reset rate limit on successful login
    if (success && rateLimit) {
      await supabase
        .from("login_rate_limits")
        .delete()
        .eq("identifier", rateLimitIdentifier);
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
