import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, CheckCircle, Zap, Globe, Cpu, Server, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

type AIProvider = 'gemini' | 'openrouter' | 'phi3' | 'queued';

interface AIMetadata {
  provider: AIProvider;
  confidence: number;
  suggestions?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflow?: {
    name: string;
    description: string;
    nodes: unknown[];
  };
  aiMetadata?: AIMetadata;
}

// Provider display config
const providerConfig: Record<AIProvider, { label: string; icon: typeof Zap; color: string; bgColor: string }> = {
  gemini: { label: 'Gemini', icon: Zap, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  openrouter: { label: 'OpenRouter', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  phi3: { label: 'Phi-3 Local', icon: Cpu, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  queued: { label: 'Queued', icon: Server, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
};

// Confidence badge component
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const color = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = percentage >= 80 ? 'bg-green-100 dark:bg-green-900/30' : percentage >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${color}`}>
      {percentage}% confidence
    </span>
  );
}

// Provider badge component
function ProviderBadge({ provider }: { provider: AIProvider }) {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your AI workflow assistant. Describe what you want to automate, and I'll help you create a workflow. For example:\n\n• Send SMS reminders to customers every morning\n• Email me when inventory is low\n• Generate reports every Friday",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userPrompt = input;
    setInput('');
    setIsLoading(true);

    try {
      // Call the actual AI API to interpret the prompt
      const response = await api.ai.interpret(userPrompt, false) as any;
      const data = response.data;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation || "I've created a workflow based on your description.",
        timestamp: new Date(),
        workflow: data.workflow ? {
          name: data.workflow.name || 'Generated Workflow',
          description: data.workflow.description || userPrompt,
          nodes: data.workflow.nodes || [],
        } : undefined,
        aiMetadata: {
          provider: data.source || 'gemini',
          confidence: data.confidence || 0.8,
          suggestions: data.suggestions,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      const provider: AIProvider = data.source || 'gemini';
      toast.success(`Workflow generated via ${providerConfig[provider].label}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate workflow';
      toast.error(errorMessage);
      console.error('AI error:', error);

      // Add error message to chat
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again with a different description.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async (workflow: Message['workflow']) => {
    if (!workflow) return;

    try {
      // Save the AI-generated workflow
      const response = await api.workflows.create({
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        connections: [], // AI should provide connections in the workflow object
        trigger: workflow.nodes[0], // First node as trigger
      }) as any;

      const newWorkflowId = response.data._id;

      toast.success('Workflow created successfully!');

      // Navigate to the workflow editor
      navigate(`/app/workflows/${newWorkflowId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create workflow');
      console.error('Create workflow error:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Assistant
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Describe your automation in natural language
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* AI Metadata badges */}
              {message.aiMetadata && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <ProviderBadge provider={message.aiMetadata.provider} />
                  <ConfidenceBadge confidence={message.aiMetadata.confidence} />
                </div>
              )}

              {message.workflow && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {message.workflow.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {message.workflow.description}
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    {message.workflow.nodes.length} node{message.workflow.nodes.length !== 1 ? 's' : ''} generated
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreateWorkflow(message.workflow)}
                    className="btn btn-primary text-sm"
                  >
                    Open in Editor
                  </button>
                </div>
              )}

              {/* AI Suggestions */}
              {message.aiMetadata?.suggestions && message.aiMetadata.suggestions.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Suggestions</span>
                  </div>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    {message.aiMetadata.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-yellow-500">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Generating workflow...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to automate..."
              className="input flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn btn-primary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

