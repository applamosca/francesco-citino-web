import { useEffect, useRef, useCallback } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        language?: string;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// Turnstile site key - this is public and safe to expose
const TURNSTILE_SITE_KEY = '0x4AAAAAACHoRzc93znwrGJY';

export const TurnstileWidget = ({ onVerify, onError, onExpire }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
    
    if (!TURNSTILE_SITE_KEY) {
      console.warn('Turnstile site key not configured');
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onVerify,
        'error-callback': onError,
        'expired-callback': onExpire,
        theme: 'auto',
        language: 'it',
      });
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
    }
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    // Check if script already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script is already in DOM
    if (document.querySelector('script[src*="turnstile"]')) {
      scriptLoadedRef.current = true;
      return;
    }

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      // Small delay to ensure turnstile is ready
      setTimeout(renderWidget, 100);
    };

    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Widget might already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  // Re-render when turnstile becomes available
  useEffect(() => {
    if (scriptLoadedRef.current && !widgetIdRef.current) {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [renderWidget]);

  if (!TURNSTILE_SITE_KEY) {
    return null; // Don't render if no site key
  }

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center my-4"
      aria-label="Verifica di sicurezza CAPTCHA"
    />
  );
};

export default TurnstileWidget;
