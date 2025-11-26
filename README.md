# Francesco Citino - Sito Web Professionale

Sito web professionale del Dr. Francesco Citino, psicologo, scienziato cognitivo, filosofo della mente e ipnologo.

## 🌟 Caratteristiche

- **Design moderno e responsive** - Ottimizzato per tutti i dispositivi
- **Animazioni fluide** - Realizzate con Framer Motion
- **SEO ottimizzato** - Meta tag OG e Twitter Cards per una perfetta condivisione social
- **Performance elevate** - Build ottimizzata con Vite
- **Accessibilità** - Interfaccia user-friendly e accessibile

## 🚀 Tecnologie

- **React 18** - Libreria UI moderna
- **TypeScript** - Type safety e migliore developer experience
- **Vite** - Build tool velocissimo
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animazioni fluide e performanti
- **Shadcn/ui** - Componenti UI accessibili e personalizzabili
- **Lovable Cloud** - Backend integrato (Supabase)

## 📦 Installazione

```bash
# Clona il repository
git clone https://github.com/[USERNAME]/francescocitino-website.git

# Entra nella directory
cd francescocitino-website

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

## 🏗️ Build

```bash
# Build per produzione
npm run build

# Preview della build
npm run preview
```

## 🌐 Deploy

Il sito viene automaticamente deployato su GitHub Pages tramite GitHub Actions ad ogni push sul branch `main`.

### Configurazione GitHub Pages

1. Vai su **Settings** → **Pages** nel repository
2. Seleziona **Source**: GitHub Actions
3. Il workflow `.github/workflows/deploy.yml` gestirà il deploy automatico

## 📁 Struttura del Progetto

```
francescocitino-website/
├── src/
│   ├── assets/          # Immagini e risorse statiche
│   ├── components/      # Componenti React
│   │   ├── ui/         # Componenti UI riutilizzabili
│   │   ├── Hero.tsx    # Sezione Hero
│   │   ├── ChiSono.tsx # Sezione biografia
│   │   ├── Servizi.tsx # Sezione servizi
│   │   ├── Libro.tsx   # Sezione libro
│   │   └── Contatti.tsx# Sezione contatti
│   ├── pages/          # Pagine dell'applicazione
│   ├── App.tsx         # Componente principale
│   └── main.tsx        # Entry point
├── public/             # File statici pubblici
├── .github/
│   └── workflows/      # GitHub Actions workflows
└── index.html          # HTML template

```

## 📝 Sezioni del Sito

### Hero
Sezione introduttiva con titolo animato e call-to-action

### Chi Sono
Biografia professionale completa con formazione multidisciplinare e approccio integrato

### Servizi
Tre aree principali:
- Consulenza Psicologica
- Ricerca e Formazione  
- Supervisione Professionale

### Libro
Presentazione del libro "Filosofia dell'Azione"

### Contatti
Email e social media per entrare in contatto

## 🎨 Personalizzazione

Il design system è configurabile tramite:
- `src/index.css` - Variabili CSS e temi
- `tailwind.config.ts` - Configurazione Tailwind

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.

## 👤 Autore

**Dr. Francesco Citino**
- Website: [francescocitino.it](https://francescocitino.it)
- Email: info@francescocitino.it
- Instagram: [@francescocitino_s.f](https://www.instagram.com/francescocitino_s.f/)

## 🤝 Contributi

Questo è un sito web personale. Per suggerimenti o segnalazioni, contatta direttamente l'autore.

---

Sviluppato con ❤️ usando [Lovable](https://lovable.dev)
