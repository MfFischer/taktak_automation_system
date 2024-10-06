import {
  Clock,
  MessageSquare,
  Mail,
  Database,
  GitBranch,
  Sparkles,
  Webhook,
  Globe,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

import { NodeType } from '@taktak/types';

interface NodeCategory {
  name: string;
  nodes: {
    type: NodeType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}

const nodeCategories: NodeCategory[] = [
  {
    name: 'Triggers',
    nodes: [
      {
        type: NodeType.SCHEDULE,
        label: 'Schedule',
        icon: Clock,
        description: 'Run on a schedule',
      },
      {
        type: NodeType.WEBHOOK,
        label: 'Webhook',
        icon: Webhook,
        description: 'Trigger via HTTP',
      },
    ],
  },
  {
    name: 'Actions',
    nodes: [
      {
        type: NodeType.SEND_SMS,
        label: 'Send SMS',
        icon: MessageSquare,
        description: 'Send SMS via Twilio',
      },
      {
        type: NodeType.SEND_EMAIL,
        label: 'Send Email',
        icon: Mail,
        description: 'Send email via SMTP',
      },
      {
        type: NodeType.HTTP_REQUEST,
        label: 'HTTP Request',
        icon: Globe,
        description: 'Make HTTP request',
      },
    ],
  },
  {
    name: 'Data',
    nodes: [
      {
        type: NodeType.DATABASE_QUERY,
        label: 'Database Query',
        icon: Database,
        description: 'Query database',
      },
      {
        type: NodeType.CSV_IMPORT,
        label: 'CSV Import',
        icon: FileText,
        description: 'Import CSV file',
      },
      {
        type: NodeType.CSV_EXPORT,
        label: 'CSV Export',
        icon: FileText,
        description: 'Export to CSV',
      },
    ],
  },
  {
    name: 'Logic',
    nodes: [
      {
        type: NodeType.CONDITION,
        label: 'Condition',
        icon: GitBranch,
        description: 'Branch logic',
      },
    ],
  },
  {
    name: 'AI',
    nodes: [
      {
        type: NodeType.AI_GENERATE,
        label: 'AI Generate',
        icon: Sparkles,
        description: 'Generate text with AI',
      },
    ],
  },
];

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Triggers', 'Actions'])
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Node Palette
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Drag or click to add nodes
        </p>
      </div>

      <div className="p-2">
        {nodeCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.name);

          return (
            <div key={category.name} className="mb-2">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <span>{category.name}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-1 space-y-1">
                  {category.nodes.map((node) => (
                    <button
                      key={node.type}
                      onClick={() => onAddNode(node.type)}
                      className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <node.icon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {node.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {node.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

