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
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { useTurnstile } from '@/hooks/useTurnstile';
import { useToast } from '@/hooks/use-toast';

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
  const [formData, setFormData] = useState({
    name: defaultName,
    email: defaultEmail,
    phone: defaultPhone,
    notes: '',
  });
  
  const { toast } = useToast();
  const { 
    token, 
    isVerifying, 
    error: turnstileError,
    handleVerify, 
    handleError, 
    handleExpire,
    verifyToken 
  } = useTurnstile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify CAPTCHA if token exists
    if (token) {
      const isValid = await verifyToken();
      if (!isValid) {
        toast({
          title: "Verifica fallita",
          description: turnstileError || "Completa la verifica CAPTCHA",
          variant: "destructive",
        });
        return;
      }
    }
    
    onSubmit(formData);
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Mario Rossi"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  placeholder="mario@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pl-10"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note (opzionale)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="pl-10 min-h-[100px]"
                  placeholder="Informazioni aggiuntive..."
                />
              </div>
            </div>

            {/* Turnstile CAPTCHA */}
            <TurnstileWidget
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleExpire}
            />
            {turnstileError && (
              <p className="text-sm text-destructive text-center">{turnstileError}</p>
            )}

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
                disabled={isLoading || isVerifying}
              >
                {isLoading || isVerifying ? 'Verifica in corso...' : 'Conferma Prenotazione'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
