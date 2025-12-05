import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_date: string;
  notes: string | null;
  status: string;
  service_id: string | null;
  user_id: string | null;
  duration_minutes: number | null;
  created_at: string;
  services?: {
    name: string;
    duration_minutes: number;
    price: number | null;
  };
}

export const useUserAppointments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['appointments', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            duration_minutes,
            price
          )
        `)
        .eq('user_id', userId)
        .order('preferred_date', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!userId,
  });
};

export const useAllAppointments = () => {
  return useQuery({
    queryKey: ['appointments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            duration_minutes,
            price
          )
        `)
        .order('preferred_date', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
  });
};

export const useBookedSlots = (date: string) => {
  return useQuery({
    queryKey: ['appointments', 'slots', date],
    queryFn: async () => {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;

      const { data, error } = await supabase
        .from('appointments')
        .select('preferred_date, duration_minutes')
        .gte('preferred_date', startOfDay)
        .lte('preferred_date', endOfDay)
        .neq('status', 'cancelled');

      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      name: string;
      email: string;
      phone?: string;
      preferred_date: string;
      notes?: string;
      service_id: string;
      user_id: string;
      duration_minutes: number;
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...appointment, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
