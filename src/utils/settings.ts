import { Settings, AIModel, AIProvider } from '../types';

const SETTINGS_KEY = 'chatbot_settings';

const DEFAULT_SETTINGS: Settings = {
  provider: 'openai' as AIProvider,
  apiKey: '',
  model: 'gpt-4o' as AIModel,
  systemPrompt: 'You are a helpful assistant.',
};

export const getSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
