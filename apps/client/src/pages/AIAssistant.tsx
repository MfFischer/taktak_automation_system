import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.explanation || "I've created a workflow based on your description.",
        timestamp: new Date(),
        workflow: response.data.workflow ? {
          name: response.data.workflow.name || 'Generated Workflow',
          description: response.data.workflow.description || userPrompt,
          nodes: response.data.workflow.nodes || [],
        } : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      toast.success('Workflow generated successfully');
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
                  <button
                    type="button"
                    onClick={() => handleCreateWorkflow(message.workflow)}
                    className="btn btn-primary text-sm"
                  >
                    Open in Editor
                  </button>
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

