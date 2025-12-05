import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingNavbar } from '@/components/booking/BookingNavbar';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingForm } from '@/components/booking/BookingForm';
import { ServiceCard } from '@/components/booking/ServiceCard';
import { useServices, Service } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';

type Step = 'service' | 'datetime' | 'confirm';

export const BookingCalendarPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: services, isLoading: servicesLoading } = useServices();
  const createAppointment = useCreateAppointment();

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleContinueToConfirm = () => {
    if (!user) {
      toast({
        title: 'Accesso richiesto',
        description: 'Devi effettuare l\'accesso per prenotare un appuntamento.',
        variant: 'destructive',
      });
      navigate('/booking/login', { state: { returnTo: '/booking/calendar' } });
      return;
    }
    setStep('confirm');
  };

  const handleSubmit = async (formData: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => {
    if (!selectedService || !selectedDate || !selectedTime || !user) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    try {
      await createAppointment.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        preferred_date: appointmentDate.toISOString(),
        service_id: selectedService.id,
        user_id: user.id,
        duration_minutes: selectedService.duration_minutes,
      });

      toast({
        title: 'Prenotazione confermata!',
        description: `Appuntamento prenotato per ${format(appointmentDate, 'dd/MM/yyyy')} alle ${selectedTime}`,
      });

      navigate('/booking/dashboard');
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la prenotazione. Riprova.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('service');
      setSelectedDate(null);
      setSelectedTime(null);
    } else if (step === 'confirm') {
      setStep('datetime');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BookingNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {['Servizio', 'Data e Ora', 'Conferma'].map((label, index) => {
              const stepIndex = ['service', 'datetime', 'confirm'].indexOf(step);
              const isActive = index === stepIndex;
              const isCompleted = index < stepIndex;

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm hidden sm:inline ${
                      isActive ? 'font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                  {index < 2 && (
                    <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
          {step === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="text-2xl font-bold mb-6 text-center">
                Scegli il Servizio
              </h1>

              {servicesLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={handleServiceSelect}
                      selected={selectedService?.id === service.id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 'datetime' && selectedService && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Indietro
                </Button>
                <h1 className="text-2xl font-bold">Scegli Data e Orario</h1>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Servizio selezionato:</p>
                <p className="font-medium">{selectedService.name}</p>
              </div>

              <BookingCalendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDateTime={handleDateTimeSelect}
                durationMinutes={selectedService.duration_minutes}
              />

              {selectedDate && selectedTime && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <Button size="lg" onClick={handleContinueToConfirm}>
                    Continua
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedService && selectedDate && selectedTime && (
            <BookingForm
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              defaultName={profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''}
              defaultEmail={user?.email || ''}
              defaultPhone={profile?.phone || ''}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={createAppointment.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingCalendarPage;
