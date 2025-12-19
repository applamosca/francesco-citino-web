import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Save, LogOut, Plus, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdminOTP } from "@/hooks/useAdminOTP";
import { useContent, useUpdateContent } from "@/hooks/useContent";
import OTPVerification from "@/components/OTPVerification";
import type { HeroContent, ChiSonoContent, ServiziContent, LibroContent, ContattiContent, ServiceItem } from "@/hooks/useContent";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isAdmin, user } = useAuth();
  const { isOTPRequired, isVerified, isLoading: otpLoading, sendOTP, verifyOTP, resetOTPState } = useAdminOTP();
  const [otpChecked, setOtpChecked] = useState(false);

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
    features: [],
    highlights: [],
    targetAudience: [],
    authorBio: "",
    quote: "",
  });
  const [contattiForm, setContattiForm] = useState<ContattiContent>({
    email: "",
    instagram: "",
    instagramUrl: "",
    facebook: "",
    facebookUrl: "",
    whatsapp: "",
    whatsappUrl: "",
  });

  const updateContentMutation = useUpdateContent();

  // Check OTP requirement when admin logs in
  useEffect(() => {
    if (session && isAdmin && user && !otpChecked) {
      setOtpChecked(true);
      sendOTP(user.id, user.email || "");
    }
  }, [session, isAdmin, user, otpChecked, sendOTP]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!session) {
      toast({
        title: "Accesso negato",
        description: "Devi effettuare il login",
        variant: "destructive",
      });
      navigate("/auth");
    } else if (!isAdmin) {
      toast({
        title: "Accesso negato",
        description: "Non hai i permessi per accedere a questa pagina",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [session, isAdmin, navigate, toast]);

  // Populate forms when data loads
  useEffect(() => {
    if (heroContent) setHeroForm(heroContent as unknown as HeroContent);
    if (chiSonoContent) setChiSonoForm(chiSonoContent as unknown as ChiSonoContent);
    if (serviziContent) setServiziForm(serviziContent as unknown as ServiziContent);
    if (libroContent) setLibroForm(libroContent as unknown as LibroContent);
    if (contattiContent) setContattiForm(contattiContent as unknown as ContattiContent);
  }, [heroContent, chiSonoContent, serviziContent, libroContent, contattiContent]);

  // Handle OTP verification
  const handleVerifyOTP = async (code: string) => {
    if (!user) return { success: false };
    return await verifyOTP(user.id, code);
  };

  const handleResendOTP = async () => {
    if (!user) return;
    await sendOTP(user.id, user.email || "");
  };

  const handleLogout = async () => {
    resetOTPState();
    navigate("/");
  };

  const handleSave = async (section: string, content: any) => {
    if (!session) {
      toast({
        title: "Errore",
        description: "Sessione scaduta. Effettua nuovamente il login.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await updateContentMutation.mutateAsync({ 
        section, 
        content,
        password: "", // Password no longer needed
      });
      toast({
        title: "Salvato!",
        description: `Sezione ${section} aggiornata con successo`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    }
  };

  // Show OTP verification screen for admins
  if (session && isAdmin && isOTPRequired && !isVerified) {
    return (
      <OTPVerification
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        isLoading={otpLoading}
        email={user?.email || ""}
      />
    );
  }

  // Show loading while checking auth
  if (!session || !isAdmin) {
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
              <CardTitle className="text-2xl">Verifica autenticazione...</CardTitle>
              <CardDescription>Reindirizzamento in corso</CardDescription>
            </CardHeader>
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
            <Button variant="outline" onClick={() => navigate("/admin/security")}>
              <Shield className="mr-2" size={18} />
              Sicurezza
            </Button>
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
            <Button onClick={() => handleSave("hero", heroForm)} disabled={updateContentMutation.isPending}>
              <Save className="mr-2" size={18} />
              {updateContentMutation.isPending ? "Salvataggio..." : "Salva Hero"}
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
            <Button onClick={() => handleSave("chi_sono", chiSonoForm)} disabled={updateContentMutation.isPending}>
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
            <Button onClick={() => handleSave("servizi", serviziForm)} disabled={updateContentMutation.isPending}>
              <Save className="mr-2" size={18} />
              Salva Servizi
            </Button>
          </CardContent>
        </Card>

        {/* Libro Section - EXPANDED */}
        <Card>
          <CardHeader>
            <CardTitle>Sezione Libro</CardTitle>
            <CardDescription>Modifica tutte le informazioni sul libro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
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
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="libro-desc2">Seconda Descrizione</Label>
                <Textarea
                  id="libro-desc2"
                  value={libroForm.secondDescription}
                  onChange={(e) => setLibroForm({ ...libroForm, secondDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Features/Tecniche Pratiche */}
            <div className="border-t pt-6">
              <Label className="text-lg">Tecniche Pratiche</Label>
              <div className="space-y-2 mt-3">
                {libroForm.features?.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...(libroForm.features || [])];
                        newFeatures[index] = e.target.value;
                        setLibroForm({ ...libroForm, features: newFeatures });
                      }}
                      placeholder="Tecnica pratica"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newFeatures = libroForm.features?.filter((_, i) => i !== index);
                        setLibroForm({ ...libroForm, features: newFeatures });
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setLibroForm({ 
                      ...libroForm, 
                      features: [...(libroForm.features || []), ""] 
                    });
                  }}
                >
                  <Plus className="mr-2" size={18} />
                  Aggiungi Tecnica
                </Button>
              </div>
            </div>

            {/* Highlights/Perché è unico */}
            <div className="border-t pt-6">
              <Label className="text-lg">Perché questo libro è unico</Label>
              <div className="space-y-2 mt-3">
                {libroForm.highlights?.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => {
                        const newHighlights = [...(libroForm.highlights || [])];
                        newHighlights[index] = e.target.value;
                        setLibroForm({ ...libroForm, highlights: newHighlights });
                      }}
                      placeholder="Punto di forza"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newHighlights = libroForm.highlights?.filter((_, i) => i !== index);
                        setLibroForm({ ...libroForm, highlights: newHighlights });
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setLibroForm({ 
                      ...libroForm, 
                      highlights: [...(libroForm.highlights || []), ""] 
                    });
                  }}
                >
                  <Plus className="mr-2" size={18} />
                  Aggiungi Highlight
                </Button>
              </div>
            </div>

            {/* Target Audience/A chi è rivolto */}
            <div className="border-t pt-6">
              <Label className="text-lg">A chi è rivolto</Label>
              <div className="space-y-2 mt-3">
                {libroForm.targetAudience?.map((audience, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={audience}
                      onChange={(e) => {
                        const newAudience = [...(libroForm.targetAudience || [])];
                        newAudience[index] = e.target.value;
                        setLibroForm({ ...libroForm, targetAudience: newAudience });
                      }}
                      placeholder="Target audience"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newAudience = libroForm.targetAudience?.filter((_, i) => i !== index);
                        setLibroForm({ ...libroForm, targetAudience: newAudience });
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setLibroForm({ 
                      ...libroForm, 
                      targetAudience: [...(libroForm.targetAudience || []), ""] 
                    });
                  }}
                >
                  <Plus className="mr-2" size={18} />
                  Aggiungi Target
                </Button>
              </div>
            </div>

            {/* Author Bio e Quote */}
            <div className="border-t pt-6 space-y-4">
              <div>
                <Label htmlFor="libro-author">Biografia Autore</Label>
                <Textarea
                  id="libro-author"
                  value={libroForm.authorBio}
                  onChange={(e) => setLibroForm({ ...libroForm, authorBio: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="libro-quote">Citazione</Label>
                <Textarea
                  id="libro-quote"
                  value={libroForm.quote}
                  onChange={(e) => setLibroForm({ ...libroForm, quote: e.target.value })}
                  rows={2}
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
            </div>

            <Button onClick={() => handleSave("libro", libroForm)} disabled={updateContentMutation.isPending}>
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
            <div>
              <Label htmlFor="contatti-facebook">Facebook Nome Pagina</Label>
              <Input
                id="contatti-facebook"
                value={contattiForm.facebook || ""}
                onChange={(e) => setContattiForm({ ...contattiForm, facebook: e.target.value })}
                placeholder="Nome pagina Facebook"
              />
            </div>
            <div>
              <Label htmlFor="contatti-facebook-url">Facebook URL</Label>
              <Input
                id="contatti-facebook-url"
                value={contattiForm.facebookUrl || ""}
                onChange={(e) => setContattiForm({ ...contattiForm, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label htmlFor="contatti-whatsapp">WhatsApp Numero</Label>
              <Input
                id="contatti-whatsapp"
                value={contattiForm.whatsapp || ""}
                onChange={(e) => setContattiForm({ ...contattiForm, whatsapp: e.target.value })}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="contatti-whatsapp-url">WhatsApp URL</Label>
              <Input
                id="contatti-whatsapp-url"
                value={contattiForm.whatsappUrl || ""}
                onChange={(e) => setContattiForm({ ...contattiForm, whatsappUrl: e.target.value })}
                placeholder="https://wa.me/..."
              />
            </div>
            <Button onClick={() => handleSave("contatti", contattiForm)} disabled={updateContentMutation.isPending}>
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