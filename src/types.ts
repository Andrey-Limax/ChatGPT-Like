export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet';

export interface Settings {
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
