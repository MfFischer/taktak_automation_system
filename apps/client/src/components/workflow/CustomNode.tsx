import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
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
} from 'lucide-react';

import { NodeType } from '@taktak/types';

const getNodeIcon = (nodeType: NodeType) => {
  switch (nodeType) {
    case NodeType.SCHEDULE:
      return Clock;
    case NodeType.SEND_SMS:
      return MessageSquare;
    case NodeType.SEND_EMAIL:
      return Mail;
    case NodeType.DATABASE_QUERY:
      return Database;
    case NodeType.CONDITION:
      return GitBranch;
    case NodeType.AI_GENERATE:
      return Sparkles;
    case NodeType.WEBHOOK:
      return Webhook;
    case NodeType.HTTP_REQUEST:
      return Globe;
    case NodeType.CSV_IMPORT:
    case NodeType.CSV_EXPORT:
      return FileText;
    default:
      return Database;
  }
};

const getNodeColor = (nodeType: NodeType) => {
  switch (nodeType) {
    case NodeType.SCHEDULE:
      return 'bg-green-500';
    case NodeType.SEND_SMS:
    case NodeType.SEND_EMAIL:
      return 'bg-blue-500';
    case NodeType.CONDITION:
      return 'bg-yellow-500';
    case NodeType.AI_GENERATE:
      return 'bg-purple-500';
    case NodeType.DATABASE_QUERY:
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

function CustomNode({ data, selected }: NodeProps) {
  const Icon = getNodeIcon(data.nodeType);
  const colorClass = getNodeColor(data.nodeType);

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white dark:bg-gray-800 min-w-[180px] ${
        selected ? 'border-primary-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* Input Handle */}
      {data.nodeType !== NodeType.SCHEDULE && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400"
        />
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded ${colorClass}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900 dark:text-white">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.description}
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400"
      />
    </div>
  );
}

export default memo(CustomNode);

