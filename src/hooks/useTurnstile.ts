import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTurnstileResult {
  token: string | null;
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
  handleVerify: (token: string) => void;
  handleError: () => void;
  handleExpire: () => void;
  verifyToken: () => Promise<boolean>;
  reset: () => void;
}

export const useTurnstile = (): UseTurnstileResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback((newToken: string) => {
    setToken(newToken);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setError('Errore nella verifica CAPTCHA. Riprova.');
  }, []);

  const handleExpire = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setError('La verifica CAPTCHA è scaduta. Riprova.');
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError('Completa la verifica CAPTCHA');
      return false;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-turnstile', {
        body: { token },
      });

      if (fnError) {
        console.error('Turnstile verification error:', fnError);
        setError('Errore nella verifica. Riprova.');
        setIsVerified(false);
        return false;
      }

      if (data?.success) {
        setIsVerified(true);
        return true;
      } else {
        setError(data?.error || 'Verifica fallita');
        setIsVerified(false);
        return false;
      }
    } catch (err) {
      console.error('Turnstile verification exception:', err);
      setError('Errore di connessione. Riprova.');
      setIsVerified(false);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [token]);

  const reset = useCallback(() => {
    setToken(null);
    setIsVerified(false);
    setIsVerifying(false);
    setError(null);
  }, []);

  return {
    token,
    isVerified,
    isVerifying,
    error,
    handleVerify,
    handleError,
    handleExpire,
    verifyToken,
    reset,
  };
};

export default useTurnstile;
