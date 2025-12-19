import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  action: "send" | "verify";
  userId?: string;
  email?: string;
  code?: string;
}

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, userId, email, code }: OTPRequest = await req.json();

    if (action === "send") {
      if (!userId || !email) {
        throw new Error("userId and email are required for sending OTP");
      }

      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: true, required: false }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Invalidate existing OTP codes for this user
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("user_id", userId)
        .eq("used", false);

      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Save OTP to database
      const { error: insertError } = await supabase
        .from("admin_otp_codes")
        .insert({
          user_id: userId,
          code: otpCode,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error("Error inserting OTP:", insertError);
        throw new Error("Failed to generate OTP");
      }

      // Send OTP via email
      if (resendApiKey) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #c49b5e;">🔐 Codice di Verifica Admin</h1>
            <p>Hai richiesto l'accesso all'area amministrativa. Inserisci il seguente codice per completare il login:</p>
            
            <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otpCode}</span>
            </div>
            
            <p style="color: #6b7280;">Questo codice scadrà tra 10 minuti.</p>
            <p style="color: #dc2626; font-size: 14px;">⚠️ Non condividere questo codice con nessuno.</p>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              Se non hai richiesto questo codice, ignora questa email e verifica la sicurezza del tuo account.
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
            from: "Admin Security <onboarding@resend.dev>",
            to: [email],
            subject: "🔐 Codice di Verifica Admin",
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error("Failed to send OTP email:", errorData);
          throw new Error("Failed to send OTP email");
        }

        console.log(`OTP sent to ${email}`);
      } else {
        console.log(`OTP for ${email}: ${otpCode} (email disabled)`);
      }

      return new Response(
        JSON.stringify({ success: true, required: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else if (action === "verify") {
      if (!userId || !code) {
        throw new Error("userId and code are required for verification");
      }

      // Find valid OTP
      const { data: otpRecord, error: fetchError } = await supabase
        .from("admin_otp_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("code", code)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        console.log(`Invalid OTP attempt for user ${userId}`);
        return new Response(
          JSON.stringify({ success: false, error: "Codice non valido o scaduto" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark OTP as used
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      console.log(`OTP verified successfully for user ${userId}`);

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else {
      throw new Error("Invalid action");
    }

  } catch (error: any) {
    console.error("Error in admin-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
