import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Definizioni dei toni disponibili
const TONE_PROMPTS: Record<string, string> = {
  professionale: `Il tuo tono è autorevole ma accogliente, mai freddo o distaccato. Scrivi in modo professionale e informativo.`,
  informale: `Il tuo tono è amichevole, colloquiale e diretto. Parla come se stessi conversando con un amico, usando un linguaggio semplice e accessibile.`,
  tecnico: `Il tuo tono è scientifico e preciso. Usa terminologia tecnica appropriata e riferimenti a studi o ricerche quando pertinente. Mantieni comunque l'accessibilità.`,
  empatico: `Il tuo tono è caldo, comprensivo e rassicurante. Metti al centro le emozioni del lettore e mostra vicinanza alle sue difficoltà.`,
  motivazionale: `Il tuo tono è energico, positivo e incoraggiante. Ispira il lettore all'azione e al cambiamento con entusiasmo controllato.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Chiave API AI non configurata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Configurazione Supabase mancante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get request body for optional parameters
    let autoPublish = false;
    let topicId: string | null = null;
    let tone: string = 'professionale';
    let saveLog = true;
    
    try {
      const body = await req.json();
      autoPublish = body.autoPublish ?? false;
      topicId = body.topicId ?? null;
      tone = body.tone ?? 'professionale';
      saveLog = body.saveLog ?? true;
    } catch {
      // No body provided, use defaults
    }

    // Valida il tono
    if (!TONE_PROMPTS[tone]) {
      tone = 'professionale';
    }

    // Fetch a random active topic
    let topic;
    if (topicId) {
      const { data, error } = await supabase
        .from('content_topics')
        .select('*')
        .eq('id', topicId)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        console.error('Topic not found:', error);
        return new Response(
          JSON.stringify({ error: 'Tema non trovato' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      topic = data;
    } else {
      const { data: topics, error } = await supabase
        .from('content_topics')
        .select('*')
        .eq('is_active', true);

      if (error || !topics || topics.length === 0) {
        console.error('No active topics found:', error);
        return new Response(
          JSON.stringify({ error: 'Nessun tema attivo trovato' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Select random topic
      topic = topics[Math.floor(Math.random() * topics.length)];
    }

    console.log('Selected topic:', topic.name, '| Tone:', tone);

    // Generate post using Lovable AI
    const toneInstruction = TONE_PROMPTS[tone];
    
    const systemPrompt = `Sei un esperto di comunicazione social per il Dott. Francesco Citino, psicologo clinico e ipnoterapeuta. 
Scrivi post Facebook brevi, empatici e professionali.
${toneInstruction}
I post devono essere informativi ma accessibili a tutti.
NON usare hashtag.
NON usare emoji in modo eccessivo (massimo 1-2 per post).
Il post deve essere massimo 500 caratteri.
Scrivi in italiano.`;

    const userPrompt = `Scrivi un post Facebook sul tema: "${topic.name}"
Descrizione del tema: ${topic.description || 'Nessuna descrizione aggiuntiva'}

Ricorda: massimo 500 caratteri, tono ${tone}, adatto alla pagina del Dott. Francesco Citino.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite richieste AI superato, riprova più tardi' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crediti AI esauriti' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Errore nella generazione AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('No text generated from AI');
      return new Response(
        JSON.stringify({ error: 'Nessun testo generato' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generated post:', generatedText.substring(0, 100) + '...');

    let published = false;
    let facebookPostId: string | null = null;
    let publishError: string | null = null;

    // If autoPublish is true, call the facebook-post function
    if (autoPublish) {
      console.log('Auto-publishing to Facebook...');
      
      const FACEBOOK_PAGE_ACCESS_TOKEN = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
      if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
        console.error('FACEBOOK_PAGE_ACCESS_TOKEN not configured');
        publishError = 'Token Facebook non configurato';
      } else {
        try {
          // Get page ID
          const meResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`);
          const meData = await meResponse.json();
          
          if (meData.error) {
            console.error('Facebook API error (me):', meData.error);
            publishError = `Errore Facebook: ${meData.error.message}`;
          } else {
            const pageId = meData.id;

            // Post to Facebook
            const postResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                message: generatedText,
                access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
              }).toString(),
            });

            const postResult = await postResponse.json();

            if (postResult.error) {
              console.error('Facebook API error (post):', postResult.error);
              publishError = `Errore pubblicazione: ${postResult.error.message}`;
            } else {
              console.log('Post published successfully:', postResult.id);
              published = true;
              facebookPostId = postResult.id;
            }
          }
        } catch (fbError) {
          console.error('Facebook publish error:', fbError);
          publishError = 'Errore durante la pubblicazione su Facebook';
        }
      }
    }

    // Salva nel log
    if (saveLog) {
      try {
        await supabase.from('ai_post_logs').insert({
          topic_id: topic.id,
          topic_name: topic.name,
          generated_text: generatedText,
          tone: tone,
          published: published,
          facebook_post_id: facebookPostId,
          error_message: publishError,
        });
        console.log('Log saved successfully');
      } catch (logError) {
        console.error('Error saving log:', logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        generatedText,
        topic: topic.name,
        topicId: topic.id,
        tone,
        published,
        facebookPostId,
        error: publishError,
        message: published ? 'Post generato e pubblicato con successo!' : 'Post generato con successo'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-post:', error);
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
