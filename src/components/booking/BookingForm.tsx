import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Service } from '@/hooks/useServices';
import { useToast } from '@/hooks/use-toast';
import { bookingFormSchema, FORM_LIMITS } from '@/lib/formValidation';
import type { BookingFormData } from '@/lib/formValidation';

interface BookingFormProps {
  service: Service;
  date: Date;
  time: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const BookingForm = ({
  service,
  date,
  time,
  defaultName = '',
  defaultEmail = '',
  defaultPhone = '',
  onSubmit,
  onBack,
  isLoading = false,
}: BookingFormProps) => {
  const [formData, setFormData] = useState<BookingFormData>({
    name: defaultName,
    email: defaultEmail,
    phone: defaultPhone,
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  
  const { toast } = useToast();

  const validateField = (field: keyof BookingFormData, value: string) => {
    const partialData = { ...formData, [field]: value };
    const result = bookingFormSchema.safeParse(partialData);
    
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field);
      setErrors(prev => ({ ...prev, [field]: fieldError?.message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = bookingFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookingFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof BookingFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Errore di validazione",
        description: "Controlla i campi del modulo",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || '',
      notes: result.data.notes || '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Conferma Prenotazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="font-medium">{service.name}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(date, "EEEE d MMMM yyyy", { locale: it })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{time} - {service.duration_minutes} minuti</span>
            </div>
            {service.price && (
              <div className="text-sm font-medium text-primary">
                €{service.price.toFixed(2)}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="Mario Rossi"
                  maxLength={FORM_LIMITS.name.max}
                  required
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="mario@email.com"
                  maxLength={FORM_LIMITS.email.max}
                  required
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="+39 123 456 7890"
                  maxLength={FORM_LIMITS.phone.max}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note (opzionale)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="pl-10 min-h-[100px]"
                  placeholder="Informazioni aggiuntive..."
                  maxLength={FORM_LIMITS.notes.max}
                  aria-invalid={!!errors.notes}
                />
              </div>
              {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Indietro
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? 'Invio in corso...' : 'Conferma Prenotazione'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
