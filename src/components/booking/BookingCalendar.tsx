import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAvailability, getTimeSlots } from '@/hooks/useAvailability';
import { useBookedSlots } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDateTime: (date: Date, time: string) => void;
  durationMinutes?: number;
}

export const BookingCalendar = ({
  selectedDate,
  selectedTime,
  onSelectDateTime,
  durationMinutes = 60,
}: BookingCalendarProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const { data: availability } = useAvailability();
  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: bookedSlots } = useBookedSlots(dateString);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !availability) return [];

    const dayOfWeek = selectedDate.getDay();
    const daySetting = availability.find((a) => a.day_of_week === dayOfWeek);

    if (!daySetting || !daySetting.is_available) return [];

    const allSlots = getTimeSlots(
      daySetting.start_time,
      daySetting.end_time,
      durationMinutes
    );

    // Filter out booked slots
    const bookedTimes = new Set(
      bookedSlots?.map((slot) => {
        const date = new Date(slot.preferred_date);
        return format(date, 'HH:mm');
      }) || []
    );

    // Filter out past times if today
    const now = new Date();
    return allSlots.filter((slot) => {
      if (bookedTimes.has(slot)) return false;

      if (isToday(selectedDate)) {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      }

      return true;
    });
  }, [selectedDate, availability, bookedSlots, durationMinutes]);

  const isDayAvailable = (date: Date) => {
    if (!availability) return false;
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return false;

    const dayOfWeek = date.getDay();
    const daySetting = availability.find((a) => a.day_of_week === dayOfWeek);
    return daySetting?.is_available ?? false;
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {format(currentWeekStart, 'd MMMM', { locale: it })} -{' '}
          {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: it })}
        </span>
        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isAvailable = isDayAvailable(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <motion.button
              key={day.toISOString()}
              whileHover={isAvailable ? { scale: 1.05 } : undefined}
              whileTap={isAvailable ? { scale: 0.95 } : undefined}
              onClick={() => isAvailable && onSelectDateTime(day, '')}
              disabled={!isAvailable}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border transition-colors',
                isAvailable
                  ? 'cursor-pointer hover:border-primary'
                  : 'cursor-not-allowed opacity-50',
                isSelected && 'bg-primary text-primary-foreground border-primary',
                isToday(day) && !isSelected && 'border-accent'
              )}
            >
              <span className="text-xs uppercase">
                {format(day, 'EEE', { locale: it })}
              </span>
              <span className="text-lg font-semibold">{format(day, 'd')}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="p-4">
          <h3 className="font-medium mb-4">
            Orari disponibili per {format(selectedDate, 'd MMMM', { locale: it })}
          </h3>

          {availableSlots.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nessun orario disponibile per questa data.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableSlots.map((time) => (
                <motion.button
                  key={time}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectDateTime(selectedDate, time)}
                  className={cn(
                    'px-3 py-2 rounded-md border text-sm font-medium transition-colors',
                    selectedTime === time
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:border-primary hover:text-primary'
                  )}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
