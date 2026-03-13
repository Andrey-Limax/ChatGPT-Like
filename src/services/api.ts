import { AIModel, AIProvider, Message } from '../types';

export const sendChatMessage = async (
  messages: Message[],
  apiKey: string,
  provider: AIProvider,
  model: AIModel,
  systemPrompt: string
): Promise<string> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const endpoint = `${supabaseUrl}/functions/v1/chat-proxy`;

  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      apiKey,
      model,
      messages: formattedMessages,
      systemPrompt,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = (errorData as Record<string, unknown>).error;
    throw new Error(
      typeof errorMessage === 'string' ? errorMessage : 'Failed to get response from AI'
    );
  }

  const data = await response.json();
  return (data as Record<string, unknown>).message as string;
};
