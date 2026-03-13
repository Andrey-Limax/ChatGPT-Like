import { useState, useEffect } from 'react';
import { Settings as SettingsType, AIModel, AIProvider, PROVIDER_MODELS } from '../types';
import { getSettings, saveSettings } from '../utils/settings';
import { ArrowLeft, Save } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'gemini', label: 'Google Gemini (Free)' },
  { value: 'groq', label: 'Groq (Free)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Anthropic Claude' },
];

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: 'Google Gemini API Key',
  groq: 'Groq API Key',
  openai: 'OpenAI API Key',
  claude: 'Anthropic API Key',
};

export default function Settings({ onBack }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsType>(getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleProviderChange = (newProvider: AIProvider) => {
    const models = PROVIDER_MODELS[newProvider];
    setSettings({
      ...settings,
      provider: newProvider,
      model: models[0],
    });
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const availableModels = PROVIDER_MODELS[settings.provider];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Chat</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="provider"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                AI Provider
              </label>
              <select
                id="provider"
                value={settings.provider}
                onChange={(e) =>
                  handleProviderChange(e.target.value as AIProvider)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Select which AI provider to use for your conversations.
              </p>
            </div>

            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {PROVIDER_LABELS[settings.provider]}
              </label>
              <input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings({ ...settings, apiKey: e.target.value })
                }
                placeholder={`Enter your ${PROVIDER_LABELS[settings.provider].toLowerCase()}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-2 text-sm text-gray-500">
                Your API key is stored locally and never sent anywhere except directly to the AI provider.
              </p>
            </div>

            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Model
              </label>
              <select
                id="model"
                value={settings.model}
                onChange={(e) =>
                  setSettings({ ...settings, model: e.target.value as AIModel })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="systemPrompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                System Prompt / Custom Instructions
              </label>
              <textarea
                id="systemPrompt"
                value={settings.systemPrompt}
                onChange={(e) =>
                  setSettings({ ...settings, systemPrompt: e.target.value })
                }
                rows={6}
                placeholder="You are a helpful assistant..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                Define how the AI should behave and respond to your messages.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              {saved && (
                <span className="text-green-600 text-sm font-medium">
                  Settings saved!
                </span>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save size={20} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
