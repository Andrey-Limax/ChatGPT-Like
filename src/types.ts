export type AIProvider = 'gemini' | 'groq' | 'openai' | 'claude';

export type AIModel =
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-32768'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-haiku-20240307';

export interface Settings {
  provider: AIProvider;
  apiKey: string;
  model: AIModel;
  systemPrompt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UploadedFile {
  name: string;
  content: string;
}

export const PROVIDER_MODELS: Record<AIProvider, AIModel[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro'],
  groq: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
};
