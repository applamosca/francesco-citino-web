import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/hooks/useAppointments';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
  onConfirm?: () => void;
  showActions?: boolean;
  isAdmin?: boolean;
}

const statusConfig = {
  pending: { label: 'In Attesa', variant: 'secondary' as const },
  confirmed: { label: 'Confermato', variant: 'default' as const },
  cancelled: { label: 'Cancellato', variant: 'destructive' as const },
  completed: { label: 'Completato', variant: 'outline' as const },
};

export const AppointmentCard = ({
  appointment,
  onCancel,
  onConfirm,
  showActions = true,
  isAdmin = false,
}: AppointmentCardProps) => {
  const appointmentDate = new Date(appointment.preferred_date);
  const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">
              {appointment.services?.name || 'Consulenza'}
            </CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(appointmentDate, "EEEE d MMMM yyyy", { locale: it })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(appointmentDate, 'HH:mm')} -{' '}
              {appointment.services?.duration_minutes || appointment.duration_minutes || 60} min
            </span>
          </div>

          {isAdmin && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{appointment.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{appointment.email}</span>
              </div>

              {appointment.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{appointment.phone}</span>
                </div>
              )}
            </>
          )}

          {appointment.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 mt-0.5" />
              <span className="line-clamp-2">{appointment.notes}</span>
            </div>
          )}

          {showActions && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <div className="flex gap-2 pt-2">
              {isAdmin && appointment.status === 'pending' && onConfirm && (
                <Button size="sm" onClick={onConfirm}>
                  Conferma
                </Button>
              )}
              {onCancel && (
                <Button size="sm" variant="destructive" onClick={onCancel}>
                  {isAdmin ? 'Cancella' : 'Annulla'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
