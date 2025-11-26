import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Save, Eye, EyeOff, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useContent, useUpdateContent } from "@/hooks/useContent";
import type { HeroContent, ChiSonoContent, ServiziContent, LibroContent, ContattiContent, ServiceItem } from "@/hooks/useContent";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Content queries
  const { data: heroContent } = useContent("hero");
  const { data: chiSonoContent } = useContent("chi_sono");
  const { data: serviziContent } = useContent("servizi");
  const { data: libroContent } = useContent("libro");
  const { data: contattiContent } = useContent("contatti");

  // Form states
  const [heroForm, setHeroForm] = useState<HeroContent>({ title: "", subtitle: "" });
  const [chiSonoForm, setChiSonoForm] = useState<ChiSonoContent>({
    mainText: "",
    approachText: "",
    approaches: [],
    goalText: "",
    goals: [],
    closingText: "",
  });
  const [serviziForm, setServiziForm] = useState<ServiziContent>({ services: [] });
  const [libroForm, setLibroForm] = useState<LibroContent>({
    title: "",
    subtitle: "",
    description: "",
    secondDescription: "",
    purchaseUrl: "",
  });
  const [contattiForm, setContattiForm] = useState<ContattiContent>({
    email: "",
    instagram: "",
    instagramUrl: "",
  });

  const updateContentMutation = useUpdateContent();

  // Check authentication from sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Populate forms when data loads
  useEffect(() => {
    if (heroContent) setHeroForm(heroContent as unknown as HeroContent);
    if (chiSonoContent) setChiSonoForm(chiSonoContent as unknown as ChiSonoContent);
    if (serviziContent) setServiziForm(serviziContent as unknown as ServiziContent);
    if (libroContent) setLibroForm(libroContent as unknown as LibroContent);
    if (contattiContent) setContattiForm(contattiContent as unknown as ContattiContent);
  }, [heroContent, chiSonoContent, serviziContent, libroContent, contattiContent]);

  const handleLogin = () => {
    // Simple password check: 'psico2025'
    if (password === "psico2025") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      toast({
        title: "Accesso consentito",
        description: "Benvenuto nel pannello admin",
      });
    } else {
      toast({
        title: "Password errata",
        description: "Riprova",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPassword("");
    toast({
      title: "Disconnesso",
      description: "Hai effettuato il logout",
    });
  };

  const handleSave = async (section: string, content: any) => {
    try {
      await updateContentMutation.mutateAsync({ section, content });
      toast({
        title: "Salvato!",
        description: `Sezione ${section} aggiornata con successo`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-primary" size={24} />
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription>Inserisci la password per accedere</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="Inserisci password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Accedi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Torna al sito
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      <div className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">CMS Admin</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Visualizza Sito
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2" size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sezione Hero</CardTitle>
            <CardDescription>Modifica titolo e sottotitolo della homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero-title">Titolo</Label>
              <Input
                id="hero-title"
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hero-subtitle">Sottotitolo</Label>
              <Input
                id="hero-subtitle"
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
              />
            </div>
            <Button onClick={() => handleSave("hero", heroForm)}>
              <Save className="mr-2" size={18} />
              Salva Hero
            </Button>
          </CardContent>
        </Card>

        {/* Chi Sono Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sezione Chi Sono</CardTitle>
            <CardDescription>Modifica i testi della sezione biografica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chisono-main">Testo Principale</Label>
              <Textarea
                id="chisono-main"
                value={chiSonoForm.mainText}
                onChange={(e) => setChiSonoForm({ ...chiSonoForm, mainText: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="chisono-closing">Testo Conclusivo</Label>
              <Textarea
                id="chisono-closing"
                value={chiSonoForm.closingText}
                onChange={(e) => setChiSonoForm({ ...chiSonoForm, closingText: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={() => handleSave("chi_sono", chiSonoForm)}>
              <Save className="mr-2" size={18} />
              Salva Chi Sono
            </Button>
          </CardContent>
        </Card>

        {/* Servizi Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sezione Servizi</CardTitle>
            <CardDescription>Modifica i servizi offerti (max 3)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviziForm.services.map((service: ServiceItem, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <Label>Servizio {index + 1}</Label>
                <Input
                  placeholder="Titolo"
                  value={service.title}
                  onChange={(e) => {
                    const newServices = [...serviziForm.services];
                    newServices[index].title = e.target.value;
                    setServiziForm({ services: newServices });
                  }}
                />
                <Textarea
                  placeholder="Descrizione"
                  value={service.description}
                  onChange={(e) => {
                    const newServices = [...serviziForm.services];
                    newServices[index].description = e.target.value;
                    setServiziForm({ services: newServices });
                  }}
                  rows={2}
                />
              </div>
            ))}
            <Button onClick={() => handleSave("servizi", serviziForm)}>
              <Save className="mr-2" size={18} />
              Salva Servizi
            </Button>
          </CardContent>
        </Card>

        {/* Libro Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sezione Libro</CardTitle>
            <CardDescription>Modifica informazioni sul libro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="libro-title">Titolo Libro</Label>
              <Input
                id="libro-title"
                value={libroForm.title}
                onChange={(e) => setLibroForm({ ...libroForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="libro-subtitle">Sottotitolo</Label>
              <Input
                id="libro-subtitle"
                value={libroForm.subtitle}
                onChange={(e) => setLibroForm({ ...libroForm, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="libro-desc">Descrizione Principale</Label>
              <Textarea
                id="libro-desc"
                value={libroForm.description}
                onChange={(e) => setLibroForm({ ...libroForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="libro-url">URL Acquisto</Label>
              <Input
                id="libro-url"
                value={libroForm.purchaseUrl}
                onChange={(e) => setLibroForm({ ...libroForm, purchaseUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <Button onClick={() => handleSave("libro", libroForm)}>
              <Save className="mr-2" size={18} />
              Salva Libro
            </Button>
          </CardContent>
        </Card>

        {/* Contatti Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sezione Contatti</CardTitle>
            <CardDescription>Modifica informazioni di contatto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contatti-email">Email</Label>
              <Input
                id="contatti-email"
                type="email"
                value={contattiForm.email}
                onChange={(e) => setContattiForm({ ...contattiForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contatti-instagram">Instagram Handle</Label>
              <Input
                id="contatti-instagram"
                value={contattiForm.instagram}
                onChange={(e) => setContattiForm({ ...contattiForm, instagram: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div>
              <Label htmlFor="contatti-instagram-url">Instagram URL</Label>
              <Input
                id="contatti-instagram-url"
                value={contattiForm.instagramUrl}
                onChange={(e) => setContattiForm({ ...contattiForm, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <Button onClick={() => handleSave("contatti", contattiForm)}>
              <Save className="mr-2" size={18} />
              Salva Contatti
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;