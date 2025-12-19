import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, MapPin, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const bookOrderSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare 100 caratteri"),
  email: z.string()
    .trim()
    .email("Inserisci un indirizzo email valido")
    .max(255, "L'email non può superare 255 caratteri"),
  phone: z.string()
    .trim()
    .max(20, "Il telefono non può superare 20 caratteri")
    .optional()
    .or(z.literal('')),
  shipping_address: z.string()
    .trim()
    .min(10, "L'indirizzo deve avere almeno 10 caratteri")
    .max(500, "L'indirizzo non può superare 500 caratteri"),
  quantity: z.number()
    .min(1, "La quantità minima è 1")
    .max(10, "La quantità massima è 10"),
});

type BookOrderData = z.infer<typeof bookOrderSchema>;

interface BookPurchaseFormProps {
  onSuccess?: () => void;
}

export const BookPurchaseForm = ({ onSuccess }: BookPurchaseFormProps) => {
  const [formData, setFormData] = useState<BookOrderData>({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
    quantity: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookOrderData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const honeypotRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const validateField = (field: keyof BookOrderData, value: string | number) => {
    const partialData = { ...formData, [field]: value };
    const result = bookOrderSchema.safeParse(partialData);
    
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field);
      setErrors(prev => ({ ...prev, [field]: fieldError?.message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChange = (field: keyof BookOrderData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Honeypot check
    if (honeypotRef.current?.value) {
      console.log('Honeypot triggered - bot detected');
      toast({
        title: "Ordine inviato!",
        description: "Riceverai una email di conferma.",
      });
      return;
    }

    // Validate form
    const result = bookOrderSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookOrderData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof BookOrderData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-book-order', {
        body: {
          name: result.data.name.trim(),
          email: result.data.email.toLowerCase().trim(),
          phone: result.data.phone?.trim() || null,
          shipping_address: result.data.shipping_address.trim(),
          quantity: result.data.quantity,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Ordine effettuato!",
        description: "Riceverai una email di conferma con i dettagli dell'ordine.",
      });

      // Reset form
      setFormData({ name: '', email: '', phone: '', shipping_address: '', quantity: 1 });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting book order:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile completare l'ordine. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Honeypot field */}
      <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <label htmlFor="company-name">Company Name</label>
        <input
          type="text"
          id="company-name"
          name="company_name"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order-name">Nome e Cognome *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="order-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="pl-10"
              placeholder="Mario Rossi"
              maxLength={100}
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
          <Label htmlFor="order-email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="order-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="pl-10"
              placeholder="mario@email.com"
              maxLength={255}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order-phone">Telefono (opzionale)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="order-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="pl-10"
              placeholder="+39 333 1234567"
              maxLength={20}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-quantity">Quantità *</Label>
          <div className="relative">
            <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="order-quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
              className="pl-10"
              min={1}
              max={10}
              required
            />
          </div>
          {errors.quantity && (
            <p className="text-sm text-destructive">{errors.quantity}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-address">Indirizzo di Spedizione *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="order-address"
            value={formData.shipping_address}
            onChange={(e) => handleChange('shipping_address', e.target.value)}
            className="pl-10 min-h-[100px] resize-none"
            placeholder="Via Roma 123, 00100 Roma (RM), Italia"
            maxLength={500}
            required
            aria-invalid={!!errors.shipping_address}
            aria-describedby={errors.shipping_address ? 'address-error' : undefined}
          />
        </div>
        {errors.shipping_address && (
          <p id="address-error" className="text-sm text-destructive">{errors.shipping_address}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Elaborazione...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Ordina il Libro
          </>
        )}
      </Button>
    </motion.form>
  );
};
