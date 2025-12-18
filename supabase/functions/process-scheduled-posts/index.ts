import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending posts that are due
    const now = new Date().toISOString();
    
    const { data: pendingPosts, error: fetchError } = await supabase
      .from('scheduled_facebook_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now);

    if (fetchError) {
      console.error('Error fetching pending posts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingPosts?.length || 0} pending posts to publish`);

    const accessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('FACEBOOK_PAGE_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Token Facebook non configurato', processed: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let errors = 0;

    for (const post of pendingPosts || []) {
      try {
        // Get page ID
        const meResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
        const meData = await meResponse.json();
        
        if (meData.error) {
          throw new Error(meData.error.message);
        }

        const pageId = meData.id;

        // Prepare post data
        const postData: Record<string, string> = {
          message: post.message,
          access_token: accessToken,
        };

        if (post.link) {
          postData.link = post.link;
        }

        let endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
        
        if (post.image_url) {
          endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
          postData.url = post.image_url;
        }

        // Post to Facebook
        const postResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(postData).toString(),
        });

        const postResult = await postResponse.json();

        if (postResult.error) {
          throw new Error(postResult.error.message);
        }

        // Update post status to published
        await supabase
          .from('scheduled_facebook_posts')
          .update({
            status: 'published',
            facebook_post_id: postResult.id || postResult.post_id,
          })
          .eq('id', post.id);

        console.log(`Published post ${post.id} successfully`);
        processed++;

      } catch (postError: any) {
        console.error(`Error publishing post ${post.id}:`, postError);
        
        // Update post status to failed
        await supabase
          .from('scheduled_facebook_posts')
          .update({
            status: 'failed',
            error_message: postError.message || 'Unknown error',
          })
          .eq('id', post.id);

        errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        errors,
        message: `Processed ${processed} posts, ${errors} failed` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-scheduled-posts:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
