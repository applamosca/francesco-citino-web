import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingNavbar } from '@/components/booking/BookingNavbar';
import { ServiceCard } from '@/components/booking/ServiceCard';
import { useServices } from '@/hooks/useServices';

export const BookingServices = () => {
  const { data: services, isLoading } = useServices();

  return (
    <div className="min-h-screen bg-background">
      <BookingNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">I Nostri Servizi</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Scegli il percorso terapeutico più adatto alle tue esigenze.
            Ogni servizio è pensato per offrirti supporto professionale e personalizzato.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link to="/booking/calendar">
            <Button size="lg">
              Prenota un Appuntamento
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingServices;
