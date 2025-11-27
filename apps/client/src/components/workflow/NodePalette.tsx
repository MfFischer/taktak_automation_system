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
  Repeat,
  AlertTriangle,
  Slack,
  Github,
  CreditCard,
  Sheet,
  Send,
  Calendar,
  FolderOpen,
  GitMerge,
  DollarSign,
  BookOpen,
  Table2,
  Trello,
  ListChecks,
  Bot,
  Brain,
  Timer,
  RefreshCw,
  Phone,
  Eye,
  ShoppingCart,
  Store,
  Cloud,
  Edit,
  Search,
  LucideIcon,
  HelpCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import {
  NodeType,
  NODE_REGISTRY,
  CATEGORY_REGISTRY,
  NodeMetadata,
  NodeCategory as NodeCategoryType
} from '@taktak/types';

// Map icon names from NODE_REGISTRY to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Clock,
  MessageSquare,
  Mail,
  Database,
  GitBranch,
  Sparkles,
  Webhook,
  Globe,
  FileText,
  Repeat,
  AlertTriangle,
  Slack,
  Github,
  CreditCard,
  Sheet,
  Send,
  Calendar,
  FolderOpen,
  GitMerge,
  DollarSign,
  BookOpen,
  Table2,
  Trello,
  ListChecks,
  Bot,
  Brain,
  Timer,
  RefreshCw,
  Phone,
  Eye,
  ShoppingCart,
  Store,
  Cloud,
  Edit,
  Search,
};

// Get icon component from icon name
function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || HelpCircle;
}

// Status badge colors
function getStatusBadge(status: NodeMetadata['status']): { bg: string; text: string; label: string } | null {
  switch (status) {
    case 'beta':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', label: 'Beta' };
    case 'planned':
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', label: 'Soon' };
    default:
      return null;
  }
}

interface NodePaletteCategory {
  id: NodeCategoryType;
  label: string;
  nodes: NodeMetadata[];
}

// Build categories from the shared registry
function buildCategories(): NodePaletteCategory[] {
  const categories: NodePaletteCategory[] = [];

  for (const cat of CATEGORY_REGISTRY) {
    const nodes = Object.values(NODE_REGISTRY)
      .filter((node) => node.category === cat.id)
      .sort((a, b) => {
        // Sort by status: stable first, then beta, then planned
        const statusOrder = { stable: 0, beta: 1, planned: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

    if (nodes.length > 0) {
      categories.push({
        id: cat.id,
        label: cat.label,
        nodes,
      });
    }
  }

  return categories;
}

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void;
  showPlannedNodes?: boolean; // Option to show/hide planned nodes
}

export default function NodePalette({ onAddNode, showPlannedNodes = true }: NodePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Triggers', 'Actions'])
  );

  // Build categories from registry (memoized)
  const nodeCategories = useMemo(() => buildCategories(), []);

  // Calculate total implemented nodes for display
  const implementedCount = useMemo(() => {
    return Object.values(NODE_REGISTRY).filter(
      (n) => n.backendImplemented && n.frontendImplemented
    ).length;
  }, []);

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
          {implementedCount} nodes available
        </p>
      </div>

      <div className="p-2">
        {nodeCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.label);

          // Filter nodes based on showPlannedNodes setting
          const visibleNodes = showPlannedNodes
            ? category.nodes
            : category.nodes.filter((n) => n.status !== 'planned');

          if (visibleNodes.length === 0) return null;

          return (
            <div key={category.id} className="mb-2">
              <button
                type="button"
                onClick={() => toggleCategory(category.label)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <span className="flex items-center gap-2">
                  {category.label}
                  <span className="text-xs text-gray-400">({visibleNodes.length})</span>
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-1 space-y-1">
                  {visibleNodes.map((node) => {
                    const IconComponent = getIcon(node.icon);
                    const statusBadge = getStatusBadge(node.status);
                    const isDisabled = node.status === 'planned';

                    return (
                      <button
                        type="button"
                        key={node.type}
                        onClick={() => !isDisabled && onAddNode(node.type)}
                        disabled={isDisabled}
                        className={`w-full flex items-start gap-2 px-3 py-2 text-left rounded transition-colors ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={isDisabled ? 'Coming soon' : node.description}
                      >
                        <IconComponent className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              isDisabled
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {node.label}
                            </span>
                            {statusBadge && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {node.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

