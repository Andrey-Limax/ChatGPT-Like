import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  provider: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
}

const callGemini = async (
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> => {
  // Gemini 2.0 models require /v1beta/ endpoint (not /v1/)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build request body — only include system_instruction when non-empty
  const requestBody: Record<string, unknown> = {
    contents: messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  };

  if (systemPrompt && systemPrompt.trim()) {
    requestBody.system_instruction = { parts: [{ text: systemPrompt }] };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, unknown>).error?.message as string ||
        'Gemini API error'
    );
  }

  const data = await response.json();
  return ((data.candidates?.[0]?.content?.parts?.[0] as Record<string, unknown>)?.text as string) || '';
};

const callGroq = async (
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> => {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, unknown>).error?.message as string ||
        'Groq API error'
    );
  }

  const data = await response.json();
  return ((data.choices?.[0]?.message as Record<string, unknown>)?.content as string) || '';
};

const callOpenAI = async (
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> => {
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, unknown>).error?.message as string ||
        'OpenAI API error'
    );
  }

  const data = await response.json();
  return ((data.choices?.[0]?.message as Record<string, unknown>)?.content as string) || '';
};

const callClaude = async (
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string> => {
  const endpoint = 'https://api.anthropic.com/v1/messages';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, unknown>).error?.message as string ||
        'Claude API error'
    );
  }

  const data = await response.json();
  return ((data.content?.[0] as Record<string, unknown>)?.text as string) || '';
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { provider, apiKey, model, messages, systemPrompt }: ChatRequest = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let responseContent: string;

    switch (provider) {
      case 'gemini':
        responseContent = await callGemini(apiKey, model, messages, systemPrompt);
        break;
      case 'groq':
        responseContent = await callGroq(apiKey, model, messages, systemPrompt);
        break;
      case 'openai':
        responseContent = await callOpenAI(apiKey, model, messages, systemPrompt);
        break;
      case 'claude':
        responseContent = await callClaude(apiKey, model, messages, systemPrompt);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown provider' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(
      JSON.stringify({ message: responseContent }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
