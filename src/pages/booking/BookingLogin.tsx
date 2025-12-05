import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingNavbar } from '@/components/booking/BookingNavbar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const BookingLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const returnTo = (location.state as { returnTo?: string })?.returnTo || '/booking/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Errore di accesso',
            description: error.message === 'Invalid login credentials'
              ? 'Email o password non corretti'
              : error.message,
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Benvenuto!',
          description: 'Accesso effettuato con successo.',
        });
      } else {
        if (password.length < 6) {
          toast({
            title: 'Password troppo corta',
            description: 'La password deve contenere almeno 6 caratteri.',
            variant: 'destructive',
          });
          return;
        }
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Errore di registrazione',
            description: error.message === 'User already registered'
              ? 'Questo indirizzo email è già registrato'
              : error.message,
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Registrazione completata!',
          description: 'Ora puoi accedere con le tue credenziali.',
        });
      }
      navigate(returnTo);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BookingNavbar />

      <div className="max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/booking"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Torna alla Home
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLogin ? 'Accedi' : 'Registrati'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Accedi per gestire i tuoi appuntamenti'
                  : 'Crea un account per prenotare'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="nome@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? 'Attendere...'
                    : isLogin
                    ? 'Accedi'
                    : 'Registrati'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {isLogin
                    ? 'Non hai un account? Registrati'
                    : 'Hai già un account? Accedi'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingLogin;
