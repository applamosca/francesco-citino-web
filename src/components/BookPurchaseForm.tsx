import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { z } from 'zod';

const shippingSchema = z.object({
  name: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri").max(100),
  email: z.string().trim().email("Inserisci un indirizzo email valido").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  shipping_address: z.string().trim().min(10, "L'indirizzo deve avere almeno 10 caratteri").max(500),
});

type ShippingData = z.infer<typeof shippingSchema>;

interface BookPurchaseFormProps {
  onSuccess?: () => void;
  bookId: string;
  price: number;
}

export const BookPurchaseForm = ({ onSuccess, bookId, price }: BookPurchaseFormProps) => {
  const [formData, setFormData] = useState<ShippingData>({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateForm = (data: ShippingData) => {
    const result = shippingSchema.safeParse(data);
    setFormValid(result.success);
    return result;
  };

  const handleChange = (field: keyof ShippingData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const result = shippingSchema.safeParse(updated);
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field);
      setErrors(prev => ({ ...prev, [field]: fieldError?.message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    validateForm(updated);
  };

  const createOrder = async (_data: any, actions: any) => {
    // Honeypot check
    if (honeypotRef.current?.value) return '';

    const result = shippingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ShippingData, string>> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as keyof ShippingData] = err.message;
      });
      setErrors(fieldErrors);
      throw new Error('Compila tutti i campi obbligatori');
    }

    return actions.order.create({
      purchase_units: [{
        amount: { value: price.toFixed(2), currency_code: 'EUR' },
        description: 'La Geometria Segreta della Mente - Copia Fisica',
      }],
    });
  };

  const onApprove = async (_data: any, actions: any) => {
    setIsProcessing(true);
    try {
      const details = await actions.order.capture();
      const transactionId = details.id || details.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      const { data: orderData, error } = await supabase.functions.invoke('create-book-order', {
        body: {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone?.trim() || null,
          shipping_address: formData.shipping_address.trim(),
          quantity: 1,
          paypal_transaction_id: transactionId,
          book_id: bookId,
        },
      });

      if (error) throw error;
      if (orderData?.error) throw new Error(orderData.error);

      setOrderComplete(true);
      toast({
        title: "Pagamento completato!",
        description: "Il tuo ordine è stato registrato. Riceverai una email di conferma.",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error processing order:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile completare l'ordine. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal error:', err);
    toast({
      title: "Errore PayPal",
      description: "Si è verificato un errore con il pagamento. Riprova.",
      variant: "destructive",
    });
  };

  if (orderComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
      >
        <CheckCircle className="mx-auto text-green-500" size={64} />
        <h3 className="text-2xl font-bold text-foreground">Ordine Confermato!</h3>
        <p className="text-muted-foreground">
          Grazie per il tuo acquisto. Riceverai una email con i dettagli dell'ordine e le informazioni sulla spedizione.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-5"
    >
      {/* Honeypot */}
      <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <label htmlFor="company-name">Company Name</label>
        <input type="text" id="company-name" name="company_name" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
      </div>

      {/* Shipping form */}
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
            />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
      </div>

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
          />
        </div>
        {errors.shipping_address && <p className="text-sm text-destructive">{errors.shipping_address}</p>}
      </div>

      <div className="border-t pt-4">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Prezzo: <span className="font-bold text-foreground text-lg">€{price.toFixed(2)}</span>
        </p>

        {isProcessing ? (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Elaborazione pagamento...</span>
          </div>
        ) : (
          <div className={!formValid ? 'opacity-50 pointer-events-none' : ''}>
            <PayPalButtons
              style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              disabled={!formValid}
            />
          </div>
        )}

        {!formValid && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Compila tutti i campi obbligatori per procedere al pagamento
          </p>
        )}
      </div>
    </motion.div>
  );
};
