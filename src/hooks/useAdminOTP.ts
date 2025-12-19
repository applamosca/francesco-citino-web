import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminOTP = () => {
  const [isOTPRequired, setIsOTPRequired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendOTP = async (userId: string, email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-otp", {
        body: { action: "send", userId, email },
      });

      if (error) throw error;

      if (data.required) {
        setIsOTPRequired(true);
        toast({
          title: "Verifica richiesta",
          description: "Un codice di verifica è stato inviato alla tua email",
        });
        return { required: true };
      } else {
        setIsVerified(true);
        return { required: false };
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      toast({
        title: "Errore",
        description: "Impossibile inviare il codice di verifica",
        variant: "destructive",
      });
      return { required: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (userId: string, code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-otp", {
        body: { action: "verify", userId, code },
      });

      if (error) throw error;

      if (data.verified) {
        setIsVerified(true);
        setIsOTPRequired(false);
        toast({
          title: "Verifica completata",
          description: "Accesso all'area admin autorizzato",
        });
        return { success: true };
      } else {
        toast({
          title: "Codice non valido",
          description: data.error || "Verifica il codice e riprova",
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      toast({
        title: "Errore",
        description: "Impossibile verificare il codice",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetOTPState = () => {
    setIsOTPRequired(false);
    setIsVerified(false);
  };

  return {
    isOTPRequired,
    isVerified,
    isLoading,
    sendOTP,
    verifyOTP,
    resetOTPState,
  };
};
