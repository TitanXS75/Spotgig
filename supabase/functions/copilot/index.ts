import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { intent, prompt, context } = body;

    // Verify permission boundary: unapproved developers can never receive private specs
    if (context?.project && !context.isOwner && !context.hasPrivateAccess) {
      delete context.project.confidential_specs;
      delete context.project.credentials;
      delete context.project.confidential_notes;
      delete context.project.detailed_requirements;
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!geminiApiKey && !openaiApiKey) {
      return new Response(
        JSON.stringify({
          fallback: true,
          message: 'Server AI keys not configured; using high-fidelity local copilot engine.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const systemPrompt = `You are the Aaspass AI Copilot for Aaspass, a hyperlocal software marketplace.
Core Principles:
1. "Public Discovery, Private Requirements": Never disclose or fabricate confidential requirements to users who lack authorized access.
2. Anti-Hallucination: Never invent developer experience, internships, or unverified skills. Only refer to skills present in the context.
3. Mark AI suggestions clearly as suggestions, not confirmed facts.
4. User Role: ${context?.userRole || 'developer'}.
Intent: ${intent || 'GENERAL_ASSIST'}.

Context:
${JSON.stringify(context, null, 2)}
`;

    let assistantReply = '';

    if (geminiApiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (!geminiRes.ok) {
        throw new Error(`Gemini API error: ${geminiRes.statusText}`);
      }

      const geminiData = await geminiRes.json();
      assistantReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (openaiApiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!openaiRes.ok) {
        throw new Error(`OpenAI API error: ${openaiRes.statusText}`);
      }

      const openaiData = await openaiRes.json();
      assistantReply = openaiData.choices?.[0]?.message?.content || '';
    }

    return new Response(
      JSON.stringify({ reply: assistantReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message, fallback: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
