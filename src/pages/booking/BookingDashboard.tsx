import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingNavbar } from '@/components/booking/BookingNavbar';
import { AppointmentCard } from '@/components/booking/AppointmentCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';

export const BookingDashboard = () => {
  const { user, loading } = useAuth();
  const { data: appointments, isLoading } = useUserAppointments(user?.id);
  const updateStatus = useUpdateAppointmentStatus();
  const { toast } = useToast();

  const { upcoming, past } = useMemo(() => {
    if (!appointments) return { upcoming: [], past: [] };

    const now = new Date();
    return {
      upcoming: appointments.filter(
        (a) => new Date(a.preferred_date) >= now && a.status !== 'cancelled'
      ),
      past: appointments.filter(
        (a) => new Date(a.preferred_date) < now || a.status === 'cancelled'
      ),
    };
  }, [appointments]);

  const handleCancel = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'cancelled' });
      toast({
        title: 'Appuntamento cancellato',
        description: 'L\'appuntamento è stato cancellato con successo.',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la cancellazione.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BookingNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/booking/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">I Miei Appuntamenti</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci le tue prenotazioni
            </p>
          </div>
          <Link to="/booking/calendar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Prenotazione
            </Button>
          </Link>
        </motion.div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prossimi ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Storico ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nessun appuntamento in programma
                </h3>
                <p className="text-muted-foreground mb-6">
                  Prenota la tua prossima consulenza
                </p>
                <Link to="/booking/calendar">
                  <Button>Prenota Ora</Button>
                </Link>
              </motion.div>
            ) : (
              upcoming.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onCancel={() => handleCancel(appointment.id)}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : past.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nessun appuntamento passato</h3>
              </motion.div>
            ) : (
              past.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    showActions={false}
                  />
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingDashboard;
