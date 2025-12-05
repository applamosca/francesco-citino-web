import { motion } from 'framer-motion';
import { Clock, Euro } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Service } from '@/hooks/useServices';

interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
  selected?: boolean;
}

export const ServiceCard = ({ service, onSelect, selected }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`h-full cursor-pointer transition-all ${
          selected
            ? 'ring-2 ring-primary border-primary'
            : 'hover:border-primary/50'
        }`}
        onClick={() => onSelect?.(service)}
      >
        <CardHeader>
          <CardTitle className="text-xl">{service.name}</CardTitle>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {service.duration_minutes} min
              </span>
              {service.price && (
                <span className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  {service.price.toFixed(2)}
                </span>
              )}
            </div>
            {onSelect && (
              <Button
                variant={selected ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(service);
                }}
              >
                {selected ? 'Selezionato' : 'Seleziona'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
