import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ArrowLeft, Plus, Trash2, Edit, Check, X, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ContentTopic {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminTopics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading, signOut } = useAuth();
  
  const [newTopic, setNewTopic] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedPost, setGeneratedPost] = useState<{ topic: string; text: string } | null>(null);
  const [publishing, setPublishing] = useState(false);

  const { data: topics, isLoading } = useQuery({
    queryKey: ["content-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_topics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContentTopic[];
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

  const handleAddTopic = async () => {
    if (!newTopic.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del tema è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from("content_topics")
        .insert({
          name: newTopic.name,
          description: newTopic.description || null,
        });

      if (error) throw error;

      toast({
        title: "Successo!",
        description: "Tema aggiunto",
      });

      setNewTopic({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["content-topics"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("content_topics")
        .update({ is_active: !currentValue })
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["content-topics"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo tema?")) return;

    try {
      const { error } = await supabase
        .from("content_topics")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Eliminato",
        description: "Tema eliminato",
      });

      queryClient.invalidateQueries({ queryKey: ["content-topics"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (topic: ContentTopic) => {
    setEditingId(topic.id);
    setEditData({ name: topic.name, description: topic.description || "" });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editData.name.trim()) return;

    try {
      const { error } = await supabase
        .from("content_topics")
        .update({
          name: editData.name,
          description: editData.description || null,
        })
        .eq("id", editingId);

      if (error) throw error;

      toast({
        title: "Salvato",
        description: "Tema aggiornato",
      });

      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["content-topics"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGeneratePost = async (topicId: string) => {
    setGenerating(topicId);
    setGeneratedPost(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-post', {
        body: { topicId, autoPublish: false },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedPost({ topic: data.topic, text: data.generatedText });
      
      toast({
        title: "Generato!",
        description: `Post generato sul tema: ${data.topic}`,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile generare il post",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const handlePublishGenerated = async () => {
    if (!generatedPost) return;
    
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-post', {
        body: { message: generatedPost.text },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Pubblicato!",
        description: "Post pubblicato su Facebook",
      });
      setGeneratedPost(null);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile pubblicare",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Gestione Temi AI
            </h1>
            <p className="text-muted-foreground">
              Gestisci i temi per la generazione automatica dei post
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/facebook')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna a Facebook
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

        {/* Add New Topic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Aggiungi Nuovo Tema
              </CardTitle>
              <CardDescription>
                L'IA userà questi temi per generare post automatici
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="topicName">Nome Tema *</Label>
                  <Input
                    id="topicName"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    placeholder="Es: Gestione dello stress"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicDesc">Descrizione (opzionale)</Label>
                  <Input
                    id="topicDesc"
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    placeholder="Breve descrizione del tema"
                  />
                </div>
              </div>
              <Button onClick={handleAddTopic} disabled={adding}>
                {adding ? "Aggiunta..." : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Tema
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Post Preview */}
        {generatedPost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Post Generato: {generatedPost.topic}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background rounded-lg border">
                  <p className="whitespace-pre-wrap">{generatedPost.text}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePublishGenerated} disabled={publishing}>
                    {publishing ? "Pubblicazione..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Pubblica su Facebook
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedPost(null)}>
                    Scarta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Topics List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Temi Configurati</CardTitle>
              <CardDescription>
                {topics?.filter(t => t.is_active).length || 0} temi attivi su {topics?.length || 0} totali
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : topics && topics.length > 0 ? (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-4 border rounded-lg transition-all ${
                        topic.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                      }`}
                    >
                      {editingId === topic.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Nome tema"
                          />
                          <Input
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            placeholder="Descrizione"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{topic.name}</h3>
                              {topic.is_active ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">Attivo</Badge>
                              ) : (
                                <Badge variant="secondary">Disattivo</Badge>
                              )}
                            </div>
                            {topic.description && (
                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePost(topic.id)}
                              disabled={generating === topic.id || !topic.is_active}
                            >
                              {generating === topic.id ? (
                                "Generando..."
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  Genera
                                </>
                              )}
                            </Button>
                            <Switch
                              checked={topic.is_active}
                              onCheckedChange={() => handleToggleActive(topic.id, topic.is_active)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(topic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(topic.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun tema configurato</p>
                  <p className="text-sm">Aggiungi il primo tema per iniziare</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTopics;
