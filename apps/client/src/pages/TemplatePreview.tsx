/**
 * Template Preview Page
 * Preview workflow template without signing up
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import {
  FileSpreadsheet, MessageSquare, Calendar, CreditCard, Database,
  Bell, Users, ShoppingCart, FileText, BarChart3, Mail, Star, Zap,
  Sparkles, Shield, Lock, Clock, Cloud
} from 'lucide-react';

// Static sample workflows (same as Home page)
const staticWorkflows: Record<string, any> = {
  'lead-capture': { id: 'lead-capture', name: 'Lead Capture to CRM', description: 'Automatically capture leads from forms and add them to your CRM with AI enrichment', category: 'Sales', nodes: ['Webhook', 'AI Enrich', 'CRM', 'Notify'], color: 'from-blue-500 to-cyan-500', icon: FileSpreadsheet },
  'lead-scoring': { id: 'lead-scoring', name: 'AI Lead Scoring', description: 'Score and prioritize leads automatically based on behavior and demographics', category: 'Sales', nodes: ['CRM Trigger', 'AI Score', 'Update Lead', 'Alert'], color: 'from-blue-600 to-indigo-500', icon: Star },
  'sales-followup': { id: 'sales-followup', name: 'Sales Follow-up', description: 'Automated follow-up sequences based on prospect engagement', category: 'Sales', nodes: ['Schedule', 'Check Status', 'Send Email', 'Update CRM'], color: 'from-cyan-500 to-blue-500', icon: Mail },
  'deal-alerts': { id: 'deal-alerts', name: 'Deal Stage Alerts', description: 'Notify sales team when deals move stages or need attention', category: 'Sales', nodes: ['CRM Webhook', 'Condition', 'Slack', 'Email'], color: 'from-blue-400 to-cyan-400', icon: Bell },
  'social-scheduler': { id: 'social-scheduler', name: 'Social Media Scheduler', description: 'AI-generated content scheduled across multiple platforms', category: 'Marketing', nodes: ['Schedule', 'AI Generate', 'Twitter', 'LinkedIn'], color: 'from-orange-500 to-red-500', icon: Calendar },
  'email-campaign': { id: 'email-campaign', name: 'Email Campaign Automation', description: 'Send personalized email campaigns based on user segments', category: 'Marketing', nodes: ['Segment', 'AI Personalize', 'Send Email', 'Track'], color: 'from-pink-500 to-rose-500', icon: Mail },
  'content-repurpose': { id: 'content-repurpose', name: 'Content Repurposing', description: 'Transform blog posts into social media content automatically', category: 'Marketing', nodes: ['RSS Feed', 'AI Transform', 'Multi-Post', 'Analytics'], color: 'from-orange-400 to-pink-500', icon: Sparkles },
  'customer-support': { id: 'customer-support', name: 'AI Customer Support', description: 'Intelligent ticket routing with AI-powered responses and escalation', category: 'Support', nodes: ['Email', 'AI Classify', 'Route', 'Reply'], color: 'from-purple-500 to-pink-500', icon: MessageSquare },
  'ticket-priority': { id: 'ticket-priority', name: 'Ticket Auto-Priority', description: 'Automatically prioritize support tickets based on urgency and customer tier', category: 'Support', nodes: ['New Ticket', 'AI Analyze', 'Set Priority', 'Assign'], color: 'from-violet-500 to-purple-500', icon: Zap },
  'invoice-automation': { id: 'invoice-automation', name: 'Invoice Processing', description: 'Extract data from invoices, validate, and sync to accounting software', category: 'Finance', nodes: ['Upload', 'AI Extract', 'Validate', 'Sync'], color: 'from-green-500 to-emerald-500', icon: CreditCard },
  'expense-approval': { id: 'expense-approval', name: 'Expense Approval', description: 'Route expense reports for approval based on amount and category', category: 'Finance', nodes: ['Submit', 'Validate', 'Route', 'Notify'], color: 'from-emerald-500 to-teal-500', icon: FileSpreadsheet },
  'onboarding': { id: 'onboarding', name: 'Employee Onboarding', description: 'Automate new hire setup across HR, IT, and communication tools', category: 'HR', nodes: ['Form', 'Create Accounts', 'Welcome', 'Schedule'], color: 'from-teal-500 to-cyan-500', icon: Users },
  'leave-request': { id: 'leave-request', name: 'Leave Request Automation', description: 'Handle leave requests with automatic approval routing', category: 'HR', nodes: ['Request', 'Check Balance', 'Route', 'Update'], color: 'from-cyan-500 to-teal-500', icon: Calendar },
  'data-sync': { id: 'data-sync', name: 'Database Sync', description: 'Keep multiple databases in sync with real-time change detection', category: 'IT Ops', nodes: ['DB Trigger', 'Transform', 'Sync', 'Log'], color: 'from-indigo-500 to-violet-500', icon: Database },
  'backup-automation': { id: 'backup-automation', name: 'Backup Automation', description: 'Scheduled backups with verification and alerts', category: 'IT Ops', nodes: ['Schedule', 'Backup', 'Verify', 'Notify'], color: 'from-indigo-400 to-violet-400', icon: Cloud },
  'ecommerce': { id: 'ecommerce', name: 'Order Processing', description: 'Process orders, update inventory, and notify customers automatically', category: 'E-commerce', nodes: ['Order', 'Inventory', 'Payment', 'Notify'], color: 'from-rose-500 to-pink-500', icon: ShoppingCart },
  'abandoned-cart': { id: 'abandoned-cart', name: 'Abandoned Cart Recovery', description: 'Send personalized reminders for abandoned shopping carts', category: 'E-commerce', nodes: ['Cart Event', 'Wait', 'AI Email', 'Track'], color: 'from-pink-500 to-rose-500', icon: Mail },
  'analytics': { id: 'analytics', name: 'Analytics Pipeline', description: 'Aggregate data from multiple sources into unified dashboards', category: 'Analytics', nodes: ['Sources', 'Transform', 'Aggregate', 'Push'], color: 'from-cyan-500 to-blue-500', icon: BarChart3 },
  'document-gen': { id: 'document-gen', name: 'Contract Generation', description: 'Generate contracts and documents from templates with AI', category: 'Legal', nodes: ['Input', 'AI Fill', 'Generate', 'Send'], color: 'from-slate-500 to-gray-600', icon: FileText },
  'contract-review': { id: 'contract-review', name: 'AI Contract Review', description: 'AI-powered contract analysis and risk identification', category: 'Legal', nodes: ['Upload', 'AI Analyze', 'Flag Risks', 'Summary'], color: 'from-gray-500 to-slate-500', icon: Shield },
};

interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  tags: string[];
  nodes: any[];
  edges: any[];
  usageCount: number;
  rating: number;
}

export default function TemplatePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [staticTemplate, setStaticTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (id) {
      // First check if it's a static template
      if (staticWorkflows[id]) {
        loadStaticTemplate(id);
      } else {
        fetchTemplate(id);
      }
    }
  }, [id]);

  const loadStaticTemplate = (templateId: string) => {
    const tmpl = staticWorkflows[templateId];
    setStaticTemplate(tmpl);

    // Generate nodes from the workflow nodes array
    const flowNodes: Node[] = tmpl.nodes.map((nodeName: string, idx: number) => ({
      id: `node-${idx}`,
      type: 'default',
      position: { x: 100 + idx * 200, y: 150 },
      data: {
        label: (
          <div className="px-4 py-3 text-center">
            <div className="font-semibold text-gray-800">{nodeName}</div>
          </div>
        ),
      },
      style: { background: '#fff', border: '2px solid #8b5cf6', borderRadius: '8px' },
    }));

    // Create edges between consecutive nodes
    const flowEdges: Edge[] = tmpl.nodes.slice(0, -1).map((_: string, idx: number) => ({
      id: `edge-${idx}`,
      source: `node-${idx}`,
      target: `node-${idx + 1}`,
      animated: true,
      style: { stroke: '#8b5cf6' },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setLoading(false);
  };

  const fetchTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/templates/${templateId}`);
      const templateData = response.data.data;
      setTemplate(templateData);

      const flowNodes: Node[] = templateData.nodes.map((node: any) => ({
        id: node.id,
        type: 'default',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: (
            <div className="px-4 py-2">
              <div className="font-semibold">{node.name}</div>
              <div className="text-xs text-gray-500">{node.type}</div>
            </div>
          ),
        },
      }));

      const flowEdges: Edge[] = templateData.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Failed to fetch template:', error);
      // Fallback: show empty template with message
      setTemplate(null);
      setStaticTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTryWithoutSignup = () => {
    // Store template in session storage for guest users
    const tmpl = template || staticTemplate;
    if (tmpl) {
      // Convert static template to expected format
      const guestTemplate = staticTemplate ? {
        _id: staticTemplate.id,
        name: staticTemplate.name,
        description: staticTemplate.description,
        category: staticTemplate.category,
        nodes: staticTemplate.nodes.map((name: string, idx: number) => ({
          id: `node-${idx}`,
          name,
          type: name.toLowerCase().replace(/\s+/g, '_'),
          position: { x: 100 + idx * 200, y: 150 },
        })),
        edges: staticTemplate.nodes.slice(0, -1).map((_: string, idx: number) => ({
          id: `edge-${idx}`,
          source: `node-${idx}`,
          target: `node-${idx + 1}`,
        })),
        tags: [staticTemplate.category],
      } : tmpl;

      sessionStorage.setItem('guestTemplate', JSON.stringify(guestTemplate));
      navigate('/workflow/guest');
    }
  };

  const handleUseTemplate = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(`/app/workflows/new?template=${id}`);
    } else {
      navigate(`/signup?redirect=/app/workflows/new?template=${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Get display data from either template or staticTemplate
  const displayData = template || (staticTemplate ? {
    name: staticTemplate.name,
    description: staticTemplate.description,
    category: staticTemplate.category,
    tags: [staticTemplate.category],
  } : null);

  if (!displayData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h2>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = staticTemplate?.icon || Zap;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              {staticTemplate && (
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${staticTemplate.color} flex items-center justify-center`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayData.name}</h1>
                <p className="text-gray-600 mb-4">{displayData.description}</p>
                <div className="flex gap-2">
                  {(displayData.tags || [displayData.category]).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTryWithoutSignup}
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
              >
                🚀 Try Without Signup
              </button>
              <button
                type="button"
                onClick={handleUseTemplate}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Preview */}
      <div className="h-[calc(100vh-200px)] p-8">
        <div className="max-w-7xl mx-auto h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-right"
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

