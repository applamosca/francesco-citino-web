import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Home', href: '/booking' },
  { label: 'Servizi', href: '/booking/services' },
  { label: 'Prenota', href: '/booking/calendar' },
];

export const BookingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/booking');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/booking" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Dott. Francesco Citino</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/booking/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                    location.pathname === '/booking/dashboard'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <User className="h-4 w-4" />
                  I Miei Appuntamenti
                </Link>
                {isAdmin && (
                  <Link
                    to="/booking/admin"
                    className="text-sm font-medium text-accent hover:text-accent/80"
                  >
                    Admin
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Esci
                </Button>
              </div>
            ) : (
              <Link to="/booking/login">
                <Button variant="default" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  Accedi
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    location.pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to="/booking/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-sm font-medium text-muted-foreground"
                  >
                    I Miei Appuntamenti
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/booking/admin"
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-sm font-medium text-accent"
                    >
                      Admin
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Esci
                  </Button>
                </>
              ) : (
                <Link to="/booking/login" onClick={() => setIsOpen(false)}>
                  <Button variant="default" size="sm" className="w-full">
                    <LogIn className="h-4 w-4 mr-1" />
                    Accedi
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
