import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SendNotificationParams {
  email: string;
  name: string;
  serviceName: string;
  appointmentDate: string;
  status: 'confirmed' | 'cancelled' | 'deleted';
}

export const sendAppointmentNotification = async ({
  email,
  name,
  serviceName,
  appointmentDate,
  status,
}: SendNotificationParams) => {
  const date = new Date(appointmentDate);
  const formattedDate = format(date, 'd MMMM yyyy', { locale: it });
  const formattedTime = format(date, 'HH:mm', { locale: it });

  const { data, error } = await supabase.functions.invoke('send-appointment-notification', {
    body: {
      email,
      name,
      serviceName,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      status,
    },
  });

  if (error) {
    console.error('Error sending notification:', error);
    throw error;
  }

  return data;
};
