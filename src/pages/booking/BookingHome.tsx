import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookingNavbar } from '@/components/booking/BookingNavbar';
import { useServices } from '@/hooks/useServices';
import { ServiceCard } from '@/components/booking/ServiceCard';

const features = [
  {
    icon: Calendar,
    title: 'Prenotazione Facile',
    description: 'Scegli data e orario in pochi click',
  },
  {
    icon: Clock,
    title: 'Disponibilità in Tempo Reale',
    description: 'Vedi subito gli slot disponibili',
  },
  {
    icon: Shield,
    title: 'Sicuro e Riservato',
    description: 'I tuoi dati sono protetti',
  },
  {
    icon: Heart,
    title: 'Cura Personalizzata',
    description: 'Percorsi su misura per te',
  },
];

export const BookingHome = () => {
  const { data: services, isLoading } = useServices();

  return (
    <div className="min-h-screen bg-background">
      <BookingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Dott. Francesco Citino
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Psicologo • Ipnologo • Ricercatore in Neuroscienze
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Prenota la tua consulenza in pochi click. Un percorso di benessere
              personalizzato ti aspetta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking/calendar">
                <Button size="lg" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-5 w-5" />
                  Prenota una Consulenza
                </Button>
              </Link>
              <Link to="/booking/services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Scopri i Servizi
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center p-6">
                  <CardContent className="p-0">
                    <feature.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chi Sono */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="/placeholder.svg"
                alt="Dott. Francesco Citino"
                className="rounded-2xl shadow-lg w-full max-w-md mx-auto"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Chi Sono</h2>
              <p className="text-muted-foreground mb-4">
                Sono Francesco Citino, psicologo specializzato in ipnosi clinica
                e ricercatore nel campo delle neuroscienze cognitive.
              </p>
              <p className="text-muted-foreground mb-4">
                Il mio approccio integra le più recenti scoperte scientifiche
                con tecniche terapeutiche validate, per offrirti un percorso di
                benessere personalizzato e efficace.
              </p>
              <p className="text-muted-foreground">
                Ricevo nel mio studio a Barletta e offro anche consulenze online
                per garantire la massima flessibilità ai miei pazienti.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">I Miei Servizi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Scegli il percorso più adatto alle tue esigenze
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {services?.slice(0, 3).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/booking/services">
              <Button variant="outline">Vedi tutti i servizi</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Pronto a Iniziare il Tuo Percorso?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Prenota subito la tua prima consulenza. Il primo passo verso il
              benessere è sempre il più importante.
            </p>
            <Link to="/booking/calendar">
              <Button size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Prenota Ora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Dott. Francesco Citino - Psicologo</p>
            <p className="mt-2">
              Via Andria 52, 76121 Barletta (BT) | info@francescocitino.it
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingHome;
