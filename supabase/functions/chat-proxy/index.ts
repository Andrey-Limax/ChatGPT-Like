import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
}

const getApiEndpoint = (model: string): string => {
  if (model.startsWith('claude')) {
    return 'https://api.anthropic.com/v1/messages';
  }
  return 'https://api.openai.com/v1/chat/completions';
};

const getHeaders = (apiKey: string, model: string): HeadersInit => {
  if (model.startsWith('claude')) {
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
};

const formatMessagesForClaude = (
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
) => {
  const userMessages = messages.filter(m => m.role !== 'system');
  return {
    system: systemPrompt,
    messages: userMessages,
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { apiKey, model, messages, systemPrompt }: ChatRequest = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endpoint = getApiEndpoint(model);
    const headers = getHeaders(apiKey, model);

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    let requestBody: unknown;

    if (model.startsWith('claude')) {
      const claudeFormatted = formatMessagesForClaude(formattedMessages, systemPrompt);
      requestBody = {
        model: model,
        max_tokens: 4096,
        ...claudeFormatted,
      };
    } else {
      requestBody = {
        model: model,
        messages: formattedMessages,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as Record<string, unknown>).error?.message ||
        `API request failed: ${response.statusText}`;

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();

    let responseContent: string;
    if (model.startsWith('claude')) {
      responseContent = (data.content[0] as Record<string, unknown>).text as string;
    } else {
      responseContent = ((data.choices[0] as Record<string, unknown>).message as Record<string, unknown>).content as string;
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
