import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ArrowLeft, Send, Clock, Calendar, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ScheduledPost {
  id: string;
  message: string;
  link: string | null;
  image_url: string | null;
  scheduled_at: string;
  status: 'pending' | 'published' | 'failed';
  facebook_post_id: string | null;
  error_message: string | null;
  created_at: string;
}

const AdminFacebook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading, signOut } = useAuth();
  
  const [postNow, setPostNow] = useState({
    message: "",
    link: "",
    imageUrl: "",
  });
  const [scheduledPost, setScheduledPost] = useState({
    message: "",
    link: "",
    imageUrl: "",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [posting, setPosting] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const { data: scheduledPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["scheduled-facebook-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_facebook_posts")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as ScheduledPost[];
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

  const handlePostNow = async () => {
    if (!postNow.message.trim()) {
      toast({
        title: "Errore",
        description: "Il messaggio è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke('facebook-post', {
        body: {
          message: postNow.message,
          link: postNow.link || undefined,
          imageUrl: postNow.imageUrl || undefined,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Successo!",
        description: "Post pubblicato su Facebook",
      });

      setPostNow({ message: "", link: "", imageUrl: "" });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile pubblicare il post",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!scheduledPost.message.trim()) {
      toast({
        title: "Errore",
        description: "Il messaggio è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledPost.scheduledDate || !scheduledPost.scheduledTime) {
      toast({
        title: "Errore",
        description: "Seleziona data e ora per la programmazione",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = new Date(`${scheduledPost.scheduledDate}T${scheduledPost.scheduledTime}`);
    
    if (scheduledAt <= new Date()) {
      toast({
        title: "Errore",
        description: "La data programmata deve essere nel futuro",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);
    try {
      const { error } = await supabase
        .from("scheduled_facebook_posts")
        .insert({
          message: scheduledPost.message,
          link: scheduledPost.link || null,
          image_url: scheduledPost.imageUrl || null,
          scheduled_at: scheduledAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Programmato!",
        description: `Post programmato per ${format(scheduledAt, "PPpp", { locale: it })}`,
      });

      setScheduledPost({
        message: "",
        link: "",
        imageUrl: "",
        scheduledDate: "",
        scheduledTime: "",
      });
      queryClient.invalidateQueries({ queryKey: ["scheduled-facebook-posts"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile programmare il post",
        variant: "destructive",
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo post programmato?")) return;

    try {
      const { error } = await supabase
        .from("scheduled_facebook_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Eliminato",
        description: "Post programmato eliminato",
      });

      queryClient.invalidateQueries({ queryKey: ["scheduled-facebook-posts"] });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> In attesa</Badge>;
      case 'published':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Pubblicato</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Fallito</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
              Gestione Facebook
            </h1>
            <p className="text-muted-foreground">
              Pubblica e programma post sulla tua pagina Facebook
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

        <Tabs defaultValue="post-now" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="post-now">Pubblica Ora</TabsTrigger>
            <TabsTrigger value="schedule">Programma</TabsTrigger>
            <TabsTrigger value="history">Storico</TabsTrigger>
          </TabsList>

          {/* Post Now Tab */}
          <TabsContent value="post-now">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Pubblica su Facebook
                  </CardTitle>
                  <CardDescription>
                    Il post verrà pubblicato immediatamente sulla tua pagina
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Messaggio *</Label>
                    <Textarea
                      id="message"
                      value={postNow.message}
                      onChange={(e) => setPostNow({ ...postNow, message: e.target.value })}
                      placeholder="Scrivi il tuo post..."
                      rows={5}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="link">Link (opzionale)</Label>
                      <Input
                        id="link"
                        value={postNow.link}
                        onChange={(e) => setPostNow({ ...postNow, link: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">URL Immagine (opzionale)</Label>
                      <Input
                        id="imageUrl"
                        value={postNow.imageUrl}
                        onChange={(e) => setPostNow({ ...postNow, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <Button onClick={handlePostNow} disabled={posting} className="w-full md:w-auto">
                    {posting ? "Pubblicazione..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Pubblica Ora
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Programma Post
                  </CardTitle>
                  <CardDescription>
                    Programma la pubblicazione per una data e ora specifiche
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledMessage">Messaggio *</Label>
                    <Textarea
                      id="scheduledMessage"
                      value={scheduledPost.message}
                      onChange={(e) => setScheduledPost({ ...scheduledPost, message: e.target.value })}
                      placeholder="Scrivi il tuo post..."
                      rows={5}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledLink">Link (opzionale)</Label>
                      <Input
                        id="scheduledLink"
                        value={scheduledPost.link}
                        onChange={(e) => setScheduledPost({ ...scheduledPost, link: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledImageUrl">URL Immagine (opzionale)</Label>
                      <Input
                        id="scheduledImageUrl"
                        value={scheduledPost.imageUrl}
                        onChange={(e) => setScheduledPost({ ...scheduledPost, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Data *</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={scheduledPost.scheduledDate}
                        onChange={(e) => setScheduledPost({ ...scheduledPost, scheduledDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Ora *</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={scheduledPost.scheduledTime}
                        onChange={(e) => setScheduledPost({ ...scheduledPost, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSchedulePost} disabled={scheduling} className="w-full md:w-auto">
                    {scheduling ? "Programmazione..." : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Programma Post
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Post Programmati</CardTitle>
                  <CardDescription>
                    Visualizza e gestisci i post programmati
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : scheduledPosts && scheduledPosts.length > 0 ? (
                    <div className="space-y-4">
                      {scheduledPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground line-clamp-2 mb-2">
                                {post.message}
                              </p>
                              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(post.scheduled_at), "PPpp", { locale: it })}
                                </span>
                                {getStatusBadge(post.status)}
                              </div>
                              {post.error_message && (
                                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {post.error_message}
                                </p>
                              )}
                            </div>
                            {post.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteScheduled(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nessun post programmato
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminFacebook;
