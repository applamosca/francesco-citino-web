const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm md:text-base mb-2">
            © {new Date().getFullYear()} Francesco Citino. Tutti i diritti riservati.
          </p>
          <p className="text-xs md:text-sm opacity-80">
            Psicologo • Ricercatore • Autore
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
