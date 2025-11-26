import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, password, data } = await req.json();
    
    console.log('Blog admin action:', action);

    // Verify admin password
    const { data: adminData } = await supabaseAdmin
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_password')
      .single();

    if (!adminData || adminData.setting_value !== password) {
      console.error('Invalid password attempt');
      return new Response(
        JSON.stringify({ error: 'Password non valida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      // Articles
      case 'create_article':
        result = await supabaseAdmin
          .from('blog_articles')
          .insert([{
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            featured_image: data.featured_image,
            category_id: data.category_id,
            status: data.status || 'draft',
            published_at: data.status === 'published' ? new Date().toISOString() : null
          }])
          .select()
          .single();
        break;

      case 'update_article':
        result = await supabaseAdmin
          .from('blog_articles')
          .update({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            featured_image: data.featured_image,
            category_id: data.category_id,
            status: data.status,
            published_at: data.status === 'published' && !data.published_at 
              ? new Date().toISOString() 
              : data.published_at
          })
          .eq('id', data.id)
          .select()
          .single();
        break;

      case 'delete_article':
        result = await supabaseAdmin
          .from('blog_articles')
          .delete()
          .eq('id', data.id);
        break;

      case 'get_all_articles':
        result = await supabaseAdmin
          .from('blog_articles')
          .select(`
            *,
            blog_categories(id, name, slug),
            blog_article_tags(blog_tags(id, name, slug))
          `)
          .order('created_at', { ascending: false });
        break;

      // Categories
      case 'create_category':
        result = await supabaseAdmin
          .from('blog_categories')
          .insert([{
            name: data.name,
            slug: data.slug,
            description: data.description
          }])
          .select()
          .single();
        break;

      case 'update_category':
        result = await supabaseAdmin
          .from('blog_categories')
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description
          })
          .eq('id', data.id)
          .select()
          .single();
        break;

      case 'delete_category':
        result = await supabaseAdmin
          .from('blog_categories')
          .delete()
          .eq('id', data.id);
        break;

      case 'get_categories':
        result = await supabaseAdmin
          .from('blog_categories')
          .select('*')
          .order('name');
        break;

      // Tags
      case 'create_tag':
        result = await supabaseAdmin
          .from('blog_tags')
          .insert([{
            name: data.name,
            slug: data.slug
          }])
          .select()
          .single();
        break;

      case 'delete_tag':
        result = await supabaseAdmin
          .from('blog_tags')
          .delete()
          .eq('id', data.id);
        break;

      case 'get_tags':
        result = await supabaseAdmin
          .from('blog_tags')
          .select('*')
          .order('name');
        break;

      // Article Tags (junction)
      case 'add_article_tags':
        const articleTags = data.tag_ids.map((tag_id: string) => ({
          article_id: data.article_id,
          tag_id
        }));
        result = await supabaseAdmin
          .from('blog_article_tags')
          .insert(articleTags);
        break;

      case 'remove_article_tags':
        result = await supabaseAdmin
          .from('blog_article_tags')
          .delete()
          .eq('article_id', data.article_id);
        break;

      // Image upload
      case 'upload_image':
        const base64Data = data.file.split(',')[1];
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const uploadResult = await supabaseAdmin.storage
          .from('blog-images')
          .upload(data.path, buffer, {
            contentType: data.contentType,
            upsert: false
          });

        if (!uploadResult.error) {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('blog-images')
            .getPublicUrl(data.path);
          result = { data: { ...uploadResult.data, publicUrl }, error: null };
        } else {
          result = uploadResult;
        }
        break;

      case 'delete_image':
        result = await supabaseAdmin.storage
          .from('blog-images')
          .remove([data.path]);
        break;

      // Contact messages
      case 'get_messages':
        result = await supabaseAdmin
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'mark_message_read':
        result = await supabaseAdmin
          .from('contact_messages')
          .update({ read: data.read })
          .eq('id', data.id);
        break;

      case 'delete_message':
        result = await supabaseAdmin
          .from('contact_messages')
          .delete()
          .eq('id', data.id);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Azione non valida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (result.error) {
      console.error('Database error:', result.error);
      throw result.error;
    }

    console.log('Action completed successfully:', action);

    return new Response(
      JSON.stringify({ data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-admin function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});