import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Settings, Calendar, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookingNavbar } from '@/components/booking/BookingNavbar';
import { AppointmentCard } from '@/components/booking/AppointmentCard';
import { useAuth } from '@/hooks/useAuth';
import { useAllAppointments, useUpdateAppointmentStatus, Appointment } from '@/hooks/useAppointments';
import { useDeleteAppointment } from '@/hooks/useDeleteAppointment';
import { useAvailability } from '@/hooks/useAvailability';
import { sendAppointmentNotification } from '@/hooks/useAppointmentNotification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

export const BookingAdmin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { data: appointments, isLoading: appointmentsLoading } = useAllAppointments();
  const { data: availability } = useAvailability();
  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppointment = useDeleteAppointment();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((a) =>
      isWithinInterval(new Date(a.preferred_date), { start: weekStart, end: weekEnd })
    );
  }, [appointments, weekStart, weekEnd]);

  const stats = useMemo(() => {
    if (!appointments) return { total: 0, pending: 0, confirmed: 0, thisWeek: 0 };
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      thisWeek: weekAppointments.length,
    };
  }, [appointments, weekAppointments]);

  const handleConfirm = async (appointment: Appointment) => {
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status: 'confirmed' });
      toast({ title: 'Appuntamento confermato' });
      
      // Send email notification
      try {
        await sendAppointmentNotification({
          email: appointment.email,
          name: appointment.name,
          serviceName: appointment.services?.name || 'Consulenza',
          appointmentDate: appointment.preferred_date,
          status: 'confirmed',
        });
        toast({ title: 'Email di conferma inviata' });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } catch (error) {
      toast({ title: 'Errore', variant: 'destructive' });
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status: 'cancelled' });
      toast({ title: 'Appuntamento cancellato' });
      
      // Send email notification
      try {
        await sendAppointmentNotification({
          email: appointment.email,
          name: appointment.name,
          serviceName: appointment.services?.name || 'Consulenza',
          appointmentDate: appointment.preferred_date,
          status: 'cancelled',
        });
        toast({ title: 'Email di cancellazione inviata' });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } catch (error) {
      toast({ title: 'Errore', variant: 'destructive' });
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    try {
      // Send email before deleting
      try {
        await sendAppointmentNotification({
          email: appointment.email,
          name: appointment.name,
          serviceName: appointment.services?.name || 'Consulenza',
          appointmentDate: appointment.preferred_date,
          status: 'deleted',
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
      
      await deleteAppointment.mutateAsync(appointment.id);
      toast({ title: 'Appuntamento eliminato' });
      setAppointmentToDelete(null);
    } catch (error) {
      toast({ title: 'Errore durante l\'eliminazione', variant: 'destructive' });
    }
  };

  const handleAvailabilityChange = async (dayOfWeek: number, field: string, value: string | boolean) => {
    try {
      const { error } = await supabase
        .from('availability_settings')
        .update({ [field]: value })
        .eq('day_of_week', dayOfWeek);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast({ title: 'Disponibilità aggiornata' });
    } catch (error) {
      toast({ title: 'Errore durante l\'aggiornamento', variant: 'destructive' });
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

  if (!user || !isAdmin) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Pannello Amministrazione</h1>
          <p className="text-muted-foreground">
            Gestisci appuntamenti e disponibilità
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Totale', value: stats.total, icon: Calendar },
            { label: 'In Attesa', value: stats.pending, icon: Users },
            { label: 'Confermati', value: stats.confirmed, icon: Calendar },
            { label: 'Questa Settimana', value: stats.thisWeek, icon: Calendar },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <stat.icon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="appointments">
          <TabsList className="mb-6">
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appuntamenti
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Settings className="h-4 w-4 mr-2" />
              Disponibilità
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(weekStart, 'd MMM', { locale: it })} -{' '}
                {format(weekEnd, 'd MMM yyyy', { locale: it })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {appointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : weekAppointments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">
                    Nessun appuntamento questa settimana
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {weekAppointments.map((appointment) => (
                  <div key={appointment.id} className="relative">
                    <AppointmentCard
                      appointment={appointment}
                      isAdmin
                      showActions
                      onConfirm={() => handleConfirm(appointment)}
                      onCancel={() => handleCancel(appointment)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-4 right-4"
                          onClick={() => setAppointmentToDelete(appointment)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminare questo appuntamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione è irreversibile. L'appuntamento di {appointment.name} verrà eliminato permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(appointment)}>
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Orari di Disponibilità</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {availability?.map((day) => (
                  <div
                    key={day.day_of_week}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <Switch
                        checked={day.is_available}
                        onCheckedChange={(checked) =>
                          handleAvailabilityChange(day.day_of_week, 'is_available', checked)
                        }
                      />
                      <Label className="font-medium">
                        {dayNames[day.day_of_week]}
                      </Label>
                    </div>

                    {day.is_available && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={day.start_time}
                          onChange={(e) =>
                            handleAvailabilityChange(day.day_of_week, 'start_time', e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={day.end_time}
                          onChange={(e) =>
                            handleAvailabilityChange(day.day_of_week, 'end_time', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingAdmin;
