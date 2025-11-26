/**
 * Template Model
 * Represents a workflow template
 */

import { WorkflowNode, WorkflowConnection } from '@taktak/types';

export interface Template {
  _id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // e.g., "5 minutes"
  tags: string[];
  nodes: WorkflowNode[];
  edges: WorkflowConnection[];
  thumbnail?: string;
  author: string;
  usageCount: number;
  rating: number;
  featured: boolean;
  createdAt: number;
  updatedAt: number;
}

export enum TemplateCategory {
  AUTOMATION = 'automation',
  DATA_PROCESSING = 'data_processing',
  NOTIFICATIONS = 'notifications',
  INTEGRATIONS = 'integrations',
  AI_ML = 'ai_ml',
  MARKETING = 'marketing',
  SALES = 'sales',
  CUSTOMER_SUPPORT = 'customer_support',
  PRODUCTIVITY = 'productivity',
  ANALYTICS = 'analytics',
}

export const SAMPLE_TEMPLATES: Template[] = [
  {
    _id: 'template_1',
    name: 'Slack Notification on New Email',
    description: 'Automatically send a Slack message when you receive an important email in Gmail',
    category: TemplateCategory.NOTIFICATIONS,
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    tags: ['slack', 'gmail', 'notifications'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'TRIGGER' as any,
        name: 'Gmail Trigger',
        description: 'Triggers when new email arrives',
        config: {
          triggerType: 'email_received',
          filter: 'is:important',
        },
        position: { x: 100, y: 100 },
      },
      {
        id: 'slack_1',
        type: 'SLACK' as any,
        name: 'Send Slack Message',
        description: 'Sends notification to Slack',
        config: {
          operation: 'sendMessage',
          channel: '#notifications',
          message: 'New important email from {{$trigger.from}}',
        },
        position: { x: 400, y: 100 },
      },
    ],
    edges: [
      {
        from: 'trigger_1',
        to: 'slack_1',
      },
    ],
    author: 'Taktak Team',
    usageCount: 1250,
    rating: 4.8,
    featured: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    _id: 'template_2',
    name: 'AI Email Responder',
    description: 'Use OpenAI to automatically draft responses to customer emails',
    category: TemplateCategory.AI_ML,
    difficulty: 'intermediate',
    estimatedTime: '10 minutes',
    tags: ['openai', 'gmail', 'automation', 'ai'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'TRIGGER' as any,
        name: 'Gmail Trigger',
        description: 'Triggers on new customer email',
        config: {
          triggerType: 'email_received',
          filter: 'to:support@company.com',
        },
        position: { x: 100, y: 100 },
      },
      {
        id: 'openai_1',
        type: 'OPENAI' as any,
        name: 'Generate Response',
        description: 'AI generates email response',
        config: {
          operation: 'chatCompletion',
          model: 'gpt-4',
          prompt: 'Draft a professional response to: {{$trigger.body}}',
        },
        position: { x: 400, y: 100 },
      },
      {
        id: 'gmail_1',
        type: 'GMAIL' as any,
        name: 'Send Draft',
        description: 'Saves as draft for review',
        config: {
          operation: 'createDraft',
          to: '{{$trigger.from}}',
          subject: 'Re: {{$trigger.subject}}',
          body: '{{$openai_1.response}}',
        },
        position: { x: 700, y: 100 },
      },
    ],
    edges: [
      {
        from: 'trigger_1',
        to: 'openai_1',
      },
      {
        from: 'openai_1',
        to: 'gmail_1',
      },
    ],
    author: 'Taktak Team',
    usageCount: 890,
    rating: 4.9,
    featured: true,
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

