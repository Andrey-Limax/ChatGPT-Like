export type AIProvider = 'gemini' | 'groq' | 'openai' | 'claude';

export type AIModel =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-5'
  | 'claude-haiku-4-5';

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
  openai: ['gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-opus-4-20250514', 'claude-sonnet-4-5', 'claude-haiku-4-5'],
};
