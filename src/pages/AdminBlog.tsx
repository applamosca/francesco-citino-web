import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  FolderOpen,
  Upload,
  X,
  Save,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useBlogAdmin } from "@/hooks/useBlogAdmin";
import { useToast } from "@/hooks/use-toast";

interface ArticleForm {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string;
  status: "draft" | "published";
  tag_ids: string[];
}

const emptyArticle: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  category_id: "",
  status: "draft",
  tag_ids: [],
};

const AdminBlog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isAdminLoading, loading, signOut } = useAuth();
  const {
    articles,
    categories,
    tags,
    articlesLoading,
    createArticle,
    updateArticle,
    deleteArticle,
    createCategory,
    deleteCategory,
    createTag,
    deleteTag,
    uploadImage,
  } = useBlogAdmin();

  const [articleDialog, setArticleDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyArticle);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Category/Tag dialogs
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (!loading && !isAdminLoading) {
      if (!user) navigate("/auth");
      else if (!isAdmin) {
        toast({ title: "Accesso negato", description: "Non hai i permessi admin", variant: "destructive" });
        navigate("/");
      }
    }
  }, [user, isAdmin, loading, isAdminLoading, navigate, toast]);

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, featured_image: url }));
      toast({ title: "Immagine caricata" });
    } catch (error: any) {
      toast({ title: "Errore upload", description: error.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSaveArticle = async () => {
    if (!form.title || !form.content) {
      toast({ title: "Compila titolo e contenuto", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      category_id: form.category_id || null,
    };
    if (isEditing && form.id) {
      updateArticle.mutate(payload);
    } else {
      createArticle.mutate(payload);
    }
    setArticleDialog(false);
    setForm(emptyArticle);
    setIsEditing(false);
  };

  const openEditArticle = (article: any) => {
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      featured_image: article.featured_image || "",
      category_id: article.category_id || "",
      status: article.status,
      tag_ids: article.blog_article_tags?.map((t: any) => t.blog_tags?.id).filter(Boolean) || [],
    });
    setIsEditing(true);
    setArticleDialog(true);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory.mutate({
      name: newCategoryName,
      slug: generateSlug(newCategoryName),
    });
    setNewCategoryName("");
    setCategoryDialog(false);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag.mutate({
      name: newTagName,
      slug: generateSlug(newTagName),
    });
    setNewTagName("");
    setTagDialog(false);
  };

  const filteredArticles = articles?.filter(
    (a: any) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Blog</h1>
            <p className="text-muted-foreground">Articoli, categorie e tag</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/panel")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Pannello
            </Button>
            <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/auth"))}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="articles">
          <TabsList className="mb-6">
            <TabsTrigger value="articles">Articoli</TabsTrigger>
            <TabsTrigger value="categories">Categorie</TabsTrigger>
            <TabsTrigger value="tags">Tag</TabsTrigger>
          </TabsList>

          {/* ======= ARTICLES TAB ======= */}
          <TabsContent value="articles">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Cerca articoli..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button
                onClick={() => {
                  setForm(emptyArticle);
                  setIsEditing(false);
                  setArticleDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Nuovo articolo
              </Button>
            </div>

            {articlesLoading ? (
              <p className="text-muted-foreground">Caricamento articoli...</p>
            ) : (
              <div className="space-y-4">
                {filteredArticles?.map((article: any) => (
                  <Card key={article.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {article.featured_image && (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(article.published_at || article.created_at)}
                            {article.blog_categories && (
                              <span className="ml-2">• {article.blog_categories.name}</span>
                            )}
                          </p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <Badge variant={article.status === "published" ? "default" : "secondary"}>
                              {article.status === "published" ? "Pubblicato" : "Bozza"}
                            </Badge>
                            {article.blog_article_tags?.map((t: any) => (
                              <Badge key={t.blog_tags?.id} variant="outline" className="text-xs">
                                {t.blog_tags?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEditArticle(article)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredArticles?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nessun articolo trovato</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ======= CATEGORIES TAB ======= */}
          <TabsContent value="categories">
            <Button className="mb-4" onClick={() => setCategoryDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuova categoria
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((cat: any) => (
                <Card key={cat.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteCategory.mutate(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ======= TAGS TAB ======= */}
          <TabsContent value="tags">
            <Button className="mb-4" onClick={() => setTagDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuovo tag
            </Button>
            <div className="flex flex-wrap gap-3">
              {tags?.map((tag: any) => (
                <Badge key={tag.id} variant="secondary" className="text-sm py-2 px-3 gap-2">
                  {tag.name}
                  <button
                    onClick={() => deleteTag.mutate(tag.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ======= ARTICLE DIALOG ======= */}
      <Dialog open={articleDialog} onOpenChange={setArticleDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifica articolo" : "Nuovo articolo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Titolo</label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titolo dell'articolo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="slug-articolo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Estratto</label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Breve descrizione..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Contenuto</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Contenuto dell'articolo (HTML supportato)..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Categoria</label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm((p) => ({ ...p, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Stato</label>
                <Select
                  value={form.status}
                  onValueChange={(v: "draft" | "published") => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bozza</SelectItem>
                    <SelectItem value="published">Pubblicato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tag</label>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag: any) => (
                  <label key={tag.id} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={form.tag_ids.includes(tag.id)}
                      onCheckedChange={(checked) => {
                        setForm((p) => ({
                          ...p,
                          tag_ids: checked
                            ? [...p.tag_ids, tag.id]
                            : p.tag_ids.filter((id) => id !== tag.id),
                        }));
                      }}
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="text-sm font-medium text-foreground">Immagine in evidenza</label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  value={form.featured_image}
                  onChange={(e) => setForm((p) => ({ ...p, featured_image: e.target.value }))}
                  placeholder="URL immagine o carica..."
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      {uploading ? "..." : "Carica"}
                    </span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {form.featured_image && (
                <img
                  src={form.featured_image}
                  alt="Preview"
                  className="mt-2 h-32 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleDialog(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleSaveArticle}
              disabled={createArticle.isPending || updateArticle.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {createArticle.isPending || updateArticle.isPending ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======= DELETE CONFIRM ======= */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo articolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. L'articolo verrà eliminato definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteDialog) deleteArticle.mutate(deleteDialog);
                setDeleteDialog(null);
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ======= CATEGORY DIALOG ======= */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova categoria</DialogTitle>
          </DialogHeader>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome categoria"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>
              Crea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======= TAG DIALOG ======= */}
      <Dialog open={tagDialog} onOpenChange={setTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo tag</DialogTitle>
          </DialogHeader>
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nome tag"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreateTag} disabled={createTag.isPending}>
              Crea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
