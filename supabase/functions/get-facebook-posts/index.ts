import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, limit = 10 } = await req.json().catch(() => ({}));

    const accessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('FACEBOOK_PAGE_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Token Facebook non configurato' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, get the page ID
    const meResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
    const meData = await meResponse.json();
    
    if (meData.error) {
      console.error('Facebook API error (me):', meData.error);
      return new Response(
        JSON.stringify({ error: `Errore Facebook: ${meData.error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageId = meData.id;
    console.log('Page ID:', pageId);

    // If a specific post ID is requested
    if (postId) {
      // Try to get the specific post
      const postResponse = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=id,message,full_picture,created_time,permalink_url,attachments{media,type,url,title,description}&access_token=${accessToken}`
      );
      const postData = await postResponse.json();

      if (postData.error) {
        console.error('Facebook API error (post):', postData.error);
        return new Response(
          JSON.stringify({ error: `Errore nel recupero del post: ${postData.error.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, post: postData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recent posts from the page
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,full_picture,created_time,permalink_url,attachments{media,type,url,title,description}&limit=${limit}&access_token=${accessToken}`
    );
    const postsData = await postsResponse.json();

    if (postsData.error) {
      console.error('Facebook API error (posts):', postsData.error);
      return new Response(
        JSON.stringify({ error: `Errore nel recupero dei post: ${postsData.error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Posts retrieved:', postsData.data?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pageId,
        pageName: meData.name,
        posts: postsData.data || []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-facebook-posts:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
