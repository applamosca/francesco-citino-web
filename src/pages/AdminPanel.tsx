import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LogOut, 
  ArrowLeft, 
  MessageSquare, 
  Image, 
  Facebook, 
  FileText, 
  Settings,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const adminSections = [
  {
    title: "Messaggi",
    description: "Gestisci i messaggi di contatto ricevuti",
    icon: MessageSquare,
    path: "/admin/messages",
    color: "text-blue-500",
  },
  {
    title: "Galleria Foto",
    description: "Aggiungi e gestisci le foto della galleria",
    icon: Image,
    path: "/admin/gallery",
    color: "text-green-500",
  },
  {
    title: "Facebook",
    description: "Pubblica e programma post su Facebook",
    icon: Facebook,
    path: "/admin/facebook",
    color: "text-indigo-500",
  },
  {
    title: "Contenuti Sito",
    description: "Modifica i testi e contenuti del sito",
    icon: FileText,
    path: "/admin",
    color: "text-orange-500",
  },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user && !isAdmin) {
      toast({
        title: "Accesso negato",
        description: "Non hai i permessi per accedere a questa pagina",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate, toast]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile effettuare il logout",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      });
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Pannello Amministrazione
            </h1>
            <p className="text-muted-foreground">
              Gestisci tutti gli aspetti del tuo sito
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al sito
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section, index) => (
            <motion.div
              key={section.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full"
                onClick={() => navigate(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-muted ${section.color}`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                💡 Accesso admin nascosto disponibile tramite /admin/panel - 
                Condividi questo link solo con gli amministratori autorizzati
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
