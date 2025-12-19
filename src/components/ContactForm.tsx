import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { contactFormSchema, FORM_LIMITS, sanitizeText } from '@/lib/formValidation';
import type { ContactFormData } from '@/lib/formValidation';

export const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Honeypot field - should remain empty
  const honeypotRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const validateField = (field: keyof ContactFormData, value: string) => {
    const partialData = { ...formData, [field]: value };
    const result = contactFormSchema.safeParse(partialData);
    
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field);
      setErrors(prev => ({ ...prev, [field]: fieldError?.message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypotRef.current?.value) {
      console.log('Honeypot triggered - bot detected');
      // Fake success to not alert bots
      toast({
        title: "Messaggio inviato!",
        description: "Ti risponderò il prima possibile.",
      });
      return;
    }

    // Validate form
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof ContactFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize and submit
      const sanitizedData = {
        name: sanitizeText(result.data.name),
        email: result.data.email.toLowerCase().trim(),
        message: sanitizeText(result.data.message),
      };

      const { error } = await supabase
        .from('contact_messages')
        .insert(sanitizedData);

      if (error) throw error;

      // Send email notification (fire and forget - don't block UI)
      supabase.functions.invoke('send-contact-notification', {
        body: sanitizedData,
      }).catch(err => {
        console.error('Email notification failed:', err);
      });

      toast({
        title: "Messaggio inviato!",
        description: "Ti risponderò il prima possibile.",
      });

      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Honeypot field - hidden from users, catches bots */}
      <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <label htmlFor="website-url">Website URL</label>
        <input
          type="text"
          id="website-url"
          name="website_url"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-name">Nome *</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="contact-name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="pl-10"
            placeholder="Il tuo nome"
            maxLength={FORM_LIMITS.name.max}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </div>
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="pl-10"
            placeholder="la.tua@email.com"
            maxLength={FORM_LIMITS.email.max}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Messaggio *</Label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="contact-message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className="pl-10 min-h-[120px]"
            placeholder="Scrivi il tuo messaggio..."
            maxLength={FORM_LIMITS.message.max}
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.message ? (
            <p id="message-error" className="text-destructive">{errors.message}</p>
          ) : (
            <span>Min {FORM_LIMITS.message.min} caratteri</span>
          )}
          <span>{formData.message.length}/{FORM_LIMITS.message.max}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Invio in corso...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Invia Messaggio
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default ContactForm;
