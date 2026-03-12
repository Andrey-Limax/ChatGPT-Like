import { AIModel, Message } from '../types';

interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
}

const getApiEndpoint = (model: AIModel): string => {
  if (model.startsWith('claude')) {
    return 'https://api.anthropic.com/v1/messages';
  }
  return 'https://api.openai.com/v1/chat/completions';
};

const getHeaders = (apiKey: string, model: AIModel): HeadersInit => {
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

export const sendChatMessage = async (
  messages: Message[],
  apiKey: string,
  model: AIModel,
  systemPrompt: string
): Promise<string> => {
  const endpoint = getApiEndpoint(model);
  const headers = getHeaders(apiKey, model);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
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
    } as ChatCompletionRequest;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `API request failed: ${response.statusText}`
    );
  }

  const data = await response.json();

  if (model.startsWith('claude')) {
    return data.content[0].text;
  }

  return data.choices[0].message.content;
};
