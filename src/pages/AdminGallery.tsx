import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ArrowLeft, Plus, Trash2, Eye, EyeOff, GripVertical, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

const AdminGallery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading, signOut } = useAuth();
  
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    description: "",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ["admin-gallery-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as GalleryPhoto[];
    },
    enabled: isAdmin,
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, selectedFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.title) {
      toast({
        title: "Errore",
        description: "Il titolo è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = newPhoto.image_url;

      if (selectedFile) {
        imageUrl = await uploadImage() || "";
      }

      if (!imageUrl) {
        toast({
          title: "Errore",
          description: "Inserisci un'immagine o un URL",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const maxOrder = photos?.reduce((max, p) => Math.max(max, p.display_order), 0) || 0;

      const { error } = await supabase
        .from("gallery_photos")
        .insert({
          title: newPhoto.title,
          description: newPhoto.description || null,
          image_url: imageUrl,
          display_order: maxOrder + 1,
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Foto aggiunta alla galleria",
      });

      setNewPhoto({ title: "", description: "", image_url: "" });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-photos"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiungere la foto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from("gallery_photos")
        .update({ is_visible: !currentVisibility })
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-gallery-photos"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa foto?")) return;

    try {
      const { error } = await supabase
        .from("gallery_photos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Foto eliminata",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-gallery-photos"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
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
              Gestione Galleria
            </h1>
            <p className="text-muted-foreground">
              Aggiungi e gestisci le foto della galleria
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/panel')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al pannello
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

        {/* Add New Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Aggiungi Nuova Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    placeholder="Titolo della foto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Carica Immagine</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      File selezionato: {selectedFile.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="url">Oppure URL Immagine</Label>
                  <Input
                    id="url"
                    value={newPhoto.image_url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, image_url: e.target.value })}
                    placeholder="https://..."
                    disabled={!!selectedFile}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                    placeholder="Descrizione della foto..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleAddPhoto} disabled={uploading}>
                    {uploading ? (
                      <>Caricamento...</>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Aggiungi Foto
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Photos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Foto nella Galleria ({photos?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {photosLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : photos && photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative group rounded-lg overflow-hidden border ${
                        photo.is_visible ? 'border-border' : 'border-destructive/50 opacity-60'
                      }`}
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                        <div>
                          <h3 className="text-white font-bold">{photo.title}</h3>
                          {photo.description && (
                            <p className="text-white/80 text-sm mt-1 line-clamp-2">
                              {photo.description}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => handleToggleVisibility(photo.id, photo.is_visible)}
                          >
                            {photo.is_visible ? (
                              <><Eye className="h-4 w-4 mr-1" /> Visibile</>
                            ) : (
                              <><EyeOff className="h-4 w-4 mr-1" /> Nascosta</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/20"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nessuna foto nella galleria. Aggiungi la prima!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminGallery;
