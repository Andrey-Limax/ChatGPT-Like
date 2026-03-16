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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Chat</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 text-sm mt-2">Configure your AI provider and preferences</p>
          </div>

          <div className="space-y-8">
            <div>
              <label
                htmlFor="provider"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                AI Provider
              </label>
              <select
                id="provider"
                value={settings.provider}
                onChange={(e) =>
                  handleProviderChange(e.target.value as AIProvider)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
              >
                {PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                Select which AI provider to use for your conversations.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <label
                htmlFor="apiKey"
                className="block text-sm font-semibold text-gray-900 mb-3"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
              />
              <p className="mt-2 text-sm text-gray-600">
                Your API key is stored locally and never sent anywhere except directly to the AI provider.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <label
                htmlFor="model"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Model
              </label>
              <select
                id="model"
                value={settings.model}
                onChange={(e) =>
                  setSettings({ ...settings, model: e.target.value as AIModel })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <label
                htmlFor="systemPrompt"
                className="block text-sm font-semibold text-gray-900 mb-3"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none bg-gray-50 hover:bg-white"
              />
              <p className="mt-2 text-sm text-gray-600">
                Define how the AI should behave and respond to your messages.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200">
              {saved && (
                <span className="text-green-600 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Settings saved!
                </span>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
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
