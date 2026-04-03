import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  blog_categories?: { id: string; name: string; slug: string } | null;
  blog_article_tags?: { blog_tags: { id: string; name: string; slug: string } }[];
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

const callBlogAdmin = async (action: string, data?: any) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non autenticato');

  const response = await supabase.functions.invoke('blog-admin', {
    body: { action, data },
  });

  if (response.error) throw new Error(response.error.message);
  if (response.data?.error) throw new Error(response.data.error);
  return response.data?.data;
};

export const useBlogAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['admin-blog-articles'],
    queryFn: () => callBlogAdmin('get_all_articles'),
  });

  // Categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: () => callBlogAdmin('get_categories'),
  });

  // Tags
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ['admin-blog-tags'],
    queryFn: () => callBlogAdmin('get_tags'),
  });

  // Article mutations
  const createArticle = useMutation({
    mutationFn: (data: Partial<BlogArticle> & { tag_ids?: string[] }) => {
      const { tag_ids, ...articleData } = data;
      return callBlogAdmin('create_article', articleData).then(async (article) => {
        if (tag_ids?.length) {
          await callBlogAdmin('add_article_tags', { article_id: article.id, tag_ids });
        }
        return article;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-articles'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts-homepage'] });
      toast({ title: 'Articolo creato con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  const updateArticle = useMutation({
    mutationFn: (data: Partial<BlogArticle> & { tag_ids?: string[] }) => {
      const { tag_ids, ...articleData } = data;
      return callBlogAdmin('update_article', articleData).then(async (article) => {
        if (tag_ids !== undefined) {
          await callBlogAdmin('remove_article_tags', { article_id: data.id });
          if (tag_ids.length) {
            await callBlogAdmin('add_article_tags', { article_id: data.id, tag_ids });
          }
        }
        return article;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-articles'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts-homepage'] });
      toast({ title: 'Articolo aggiornato con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: (id: string) => callBlogAdmin('delete_article', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-articles'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts-homepage'] });
      toast({ title: 'Articolo eliminato' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  // Category mutations
  const createCategory = useMutation({
    mutationFn: (data: Partial<BlogCategory>) => callBlogAdmin('create_category', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      toast({ title: 'Categoria creata' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => callBlogAdmin('delete_category', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      toast({ title: 'Categoria eliminata' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  // Tag mutations
  const createTag = useMutation({
    mutationFn: (data: Partial<BlogTag>) => callBlogAdmin('create_tag', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] });
      toast({ title: 'Tag creato' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) => callBlogAdmin('delete_tag', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] });
      toast({ title: 'Tag eliminato' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  // Image upload
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const path = `articles/${Date.now()}-${file.name}`;
          const result = await callBlogAdmin('upload_image', {
            file: reader.result,
            path,
            contentType: file.type,
          });
          resolve(result.publicUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    articles: articles as BlogArticle[] | undefined,
    categories: categories as BlogCategory[] | undefined,
    tags: tags as BlogTag[] | undefined,
    articlesLoading,
    categoriesLoading,
    tagsLoading,
    createArticle,
    updateArticle,
    deleteArticle,
    createCategory,
    deleteCategory,
    createTag,
    deleteTag,
    uploadImage,
  };
};
