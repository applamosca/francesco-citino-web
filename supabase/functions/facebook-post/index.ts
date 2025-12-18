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
    const { message, link, imageUrl } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Il messaggio è obbligatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('FACEBOOK_PAGE_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Token Facebook non configurato' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, get the page ID from the access token
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

    // Prepare the post data
    const postData: Record<string, string> = {
      message: message,
      access_token: accessToken,
    };

    // Add optional link
    if (link) {
      postData.link = link;
    }

    let endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    
    // If there's an image URL, use photos endpoint instead
    if (imageUrl) {
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
      postData.url = imageUrl;
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
      console.error('Facebook API error (post):', postResult.error);
      return new Response(
        JSON.stringify({ error: `Errore pubblicazione: ${postResult.error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Post created successfully:', postResult.id || postResult.post_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        postId: postResult.id || postResult.post_id,
        message: 'Post pubblicato con successo!' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in facebook-post:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
