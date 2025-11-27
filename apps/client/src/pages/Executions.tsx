import { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Eye,
  RotateCcw,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { ExecutionStatus, WorkflowExecution, ExecutionLog } from '@taktak/types';
import { config } from '../config/environment';

// Execution status badge component
function StatusBadge({ status }: { status: ExecutionStatus }) {
  const statusConfig = {
    [ExecutionStatus.SUCCESS]: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Success' },
    [ExecutionStatus.FAILED]: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Failed' },
    [ExecutionStatus.RUNNING]: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Running' },
    [ExecutionStatus.PENDING]: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' },
    [ExecutionStatus.CANCELLED]: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30', label: 'Cancelled' },
  };

  const cfg = statusConfig[status] || statusConfig[ExecutionStatus.PENDING];
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
      <Icon className={`w-3.5 h-3.5 ${cfg.color} ${status === ExecutionStatus.RUNNING ? 'animate-spin' : ''}`} />
      <span className={cfg.color}>{cfg.label}</span>
    </span>
  );
}

// Format duration
function formatDuration(ms?: number): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

// Execution detail panel
function ExecutionDetail({ execution, onClose, onRetry }: {
  execution: WorkflowExecution;
  onClose: () => void;
  onRetry: (id: string) => void;
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Group logs by nodeId
  const logsByNode = execution.logs.reduce((acc, log) => {
    const key = log.nodeId || '_workflow';
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<string, ExecutionLog[]>);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Execution Details</h3>
          <p className="text-sm text-gray-500">{execution._id}</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Execution Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <StatusBadge status={execution.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Workflow</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{execution.workflowName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Started</span>
          <span className="text-sm text-gray-900 dark:text-white">{formatDate(execution.startedAt)}</span>
        </div>
        {execution.completedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Completed</span>
            <span className="text-sm text-gray-900 dark:text-white">{formatDate(execution.completedAt)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Duration</span>
          <span className="text-sm font-mono text-gray-900 dark:text-white">{formatDuration(execution.duration)}</span>
        </div>
      </div>

      {/* Error info */}
      {execution.error && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{execution.error.message}</p>
              {execution.error.nodeId && (
                <p className="text-xs text-red-500 mt-1">Node: {execution.error.nodeId}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs by Node */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Execution Logs</h4>
        <div className="space-y-2">
          {Object.entries(logsByNode).map(([nodeId, logs]) => {
            const isExpanded = expandedNodes.has(nodeId);
            const hasErrors = logs.some(l => l.level === 'error');
            const hasWarnings = logs.some(l => l.level === 'warn');

            return (
              <div key={nodeId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNode(nodeId)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    hasErrors ? 'bg-red-50 dark:bg-red-900/10' : hasWarnings ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span className="text-sm font-medium">{nodeId === '_workflow' ? 'Workflow' : nodeId}</span>
                    <span className="text-xs text-gray-500">({logs.length} logs)</span>
                  </div>
                  {hasErrors && <XCircle className="w-4 h-4 text-red-500" />}
                  {!hasErrors && hasWarnings && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                  {!hasErrors && !hasWarnings && <CheckCircle className="w-4 h-4 text-green-500" />}
                </button>
                {isExpanded && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2 py-1 text-xs font-mono">
                        <span className="text-gray-400 w-20 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`w-12 flex-shrink-0 ${
                          log.level === 'error' ? 'text-red-500' :
                          log.level === 'warn' ? 'text-yellow-500' :
                          log.level === 'debug' ? 'text-gray-400' : 'text-blue-500'
                        }`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 break-all">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        {execution.status === ExecutionStatus.FAILED && (
          <button
            type="button"
            onClick={() => onRetry(execution._id)}
            className="flex-1 btn btn-primary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Execution
          </button>
        )}
        <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
}

export default function Executions() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch executions
  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${config.apiUrl}/api/executions?${params}`);
      const data = await response.json();

      if (data.success) {
        setExecutions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  // Retry execution
  const handleRetry = async (id: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/executions/${id}/retry`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchExecutions();
        setSelectedExecution(null);
      }
    } catch (error) {
      console.error('Failed to retry execution:', error);
    }
  };

  // Delete execution
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this execution?')) return;
    try {
      const response = await fetch(`${config.apiUrl}/api/executions/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchExecutions();
      }
    } catch (error) {
      console.error('Failed to delete execution:', error);
    }
  };

  // Filter executions by search term
  const filteredExecutions = executions.filter(exec =>
    exec.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exec._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Executions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and debug workflow executions</p>
        </div>
        <button
          type="button"
          onClick={fetchExecutions}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by workflow name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExecutionStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value={ExecutionStatus.SUCCESS}>Success</option>
            <option value={ExecutionStatus.FAILED}>Failed</option>
            <option value={ExecutionStatus.RUNNING}>Running</option>
            <option value={ExecutionStatus.PENDING}>Pending</option>
            <option value={ExecutionStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Executions list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredExecutions.length === 0 ? (
        <div className="card text-center py-12">
          <Play className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No executions found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Run a workflow to see execution history here
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExecutions.map((execution) => (
                <tr key={execution._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-4">
                    <StatusBadge status={execution.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{execution.workflowName}</div>
                    <div className="text-xs text-gray-500 font-mono">{execution._id.slice(0, 12)}...</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatDate(execution.startedAt)}</td>
                  <td className="px-4 py-4 text-sm font-mono text-gray-500">{formatDuration(execution.duration)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedExecution(execution)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {execution.status === ExecutionStatus.FAILED && (
                        <button
                          type="button"
                          onClick={() => handleRetry(execution._id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Retry"
                        >
                          <RotateCcw className="w-4 h-4 text-blue-500" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(execution._id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Execution detail panel */}
      {selectedExecution && (
        <ExecutionDetail
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}

