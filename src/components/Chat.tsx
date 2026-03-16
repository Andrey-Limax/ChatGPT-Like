import { useState, useRef, useEffect } from 'react';
import { Message, UploadedFile } from '../types';
import { getSettings } from '../utils/settings';
import { sendChatMessage } from '../services/api';
import { extractTextFromPDF } from '../utils/pdf';
import { Settings, Send, Upload, Loader2, FileText, X } from 'lucide-react';

interface ChatProps {
  onOpenSettings: () => void;
}

export default function Chat({ onOpenSettings }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await extractTextFromPDF(file);
      setUploadedFile({ name: file.name, content: text });
    } catch (err) {
      setError('Failed to extract text from PDF');
      console.error(err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const settings = getSettings();
    if (!settings.apiKey) {
      setError('Please set your API key in Settings');
      return;
    }

    setError('');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const contextMessage = uploadedFile
      ? `[Context from ${uploadedFile.name}]\n\n${uploadedFile.content}\n\n---\n\n${input.trim()}`
      : input.trim();

    const messagesToSend = [
      ...messages,
      { ...userMessage, content: contextMessage },
    ];

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(
        messagesToSend,
        settings.apiKey,
        settings.provider,
        settings.model,
        settings.systemPrompt
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get response from AI'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="gradient-header text-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Chat Assistant</h1>
          <p className="text-blue-100 text-sm mt-1">Powered by your choice of AI</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white font-medium"
        >
          <Settings size={20} />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg">
                <Send size={36} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Start a conversation
              </h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Send a message to begin chatting with your AI assistant. You can also upload PDFs for context.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex message-bubble ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start message-bubble">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                  <span className="font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-gradient-to-t from-slate-100 to-transparent px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {uploadedFile && (
            <div className="mb-3 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-green-700">
                <FileText size={18} />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="chat-input-group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="application/pdf"
              className="hidden"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center justify-center w-12 h-12 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                title="Upload PDF"
              >
                <Upload size={20} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-lg text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
