import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Scroll spy logic
      const sections = ["hero", "chi-sono", "servizi", "libro", "contatti"];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const navItems = [
    { label: "Chi Sono", id: "chi-sono" },
    { label: "Servizi", id: "servizi" },
    { label: "Libro", id: "libro" },
    { label: "Contatti", id: "contatti" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl shadow-xl border-b border-border/30" 
          : "bg-background/30 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${
          isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
        }`}>
          <button
            onClick={() => scrollToSection("hero")}
            className={`font-bold text-primary hover:text-accent transition-all duration-500 ${
              isScrolled ? "text-lg md:text-xl" : "text-xl md:text-2xl"
            }`}
          >
            Francesco Citino
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative pb-1 font-medium transition-all duration-300 ${
                  activeSection === item.id 
                    ? "text-primary" 
                    : "text-foreground/70 hover:text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                    initial={false}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 35,
                      duration: 0.6
                    }}
                  />
                )}
                {activeSection !== item.id && (
                  <motion.div
                    className="absolute -bottom-0 left-0 right-0 h-0.5 bg-primary/30 rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden bg-background/90 backdrop-blur-xl border-t border-border/50 shadow-2xl"
          >
            <motion.div 
              className="container mx-auto px-4 py-4 space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left font-medium py-3 px-4 rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground hover:bg-secondary hover:text-primary"
                  }`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
