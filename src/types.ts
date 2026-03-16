export type AIProvider = 'gemini' | 'groq' | 'openai' | 'claude';

export type AIModel =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001';

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
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-lite'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  openai: ['gpt-4.1', 'gpt-4.1-mini'],
  claude: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
};
