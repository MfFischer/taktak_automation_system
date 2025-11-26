import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Node, Edge } from 'reactflow';
import { ArrowLeft, Loader2, History, Save, Cloud, CloudOff } from 'lucide-react';
import toast from 'react-hot-toast';

import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import { WorkflowVersionHistory } from '../components/WorkflowVersionHistory';
import { api } from '../services/api';

// Auto-save configuration
const AUTO_SAVE_DELAY = 3000; // 3 seconds debounce

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  config: any;
  position?: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
  condition?: string;
}

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  status: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  trigger: WorkflowNode;
}

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [initialNodes, setInitialNodes] = useState<Node[]>([]);
  const [initialEdges, setInitialEdges] = useState<Edge[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentNodesRef = useRef<Node[]>([]);
  const currentEdgesRef = useRef<Edge[]>([]);

  // Fetch workflow data if editing existing workflow
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.workflows.get(id) as any;
        const workflowData = response.data;
        setWorkflow(workflowData);
        setWorkflowName(workflowData.name);

        // Convert workflow nodes to React Flow nodes
        const reactFlowNodes: Node[] = workflowData.nodes.map((node: WorkflowNode, index: number) => ({
          id: node.id,
          type: 'custom',
          position: node.position || { x: 250, y: 100 + index * 150 },
          data: {
            label: node.name,
            nodeType: node.type,
            config: node.config,
          },
        }));

        // Convert workflow connections to React Flow edges
        const reactFlowEdges: Edge[] = workflowData.connections.map((conn: WorkflowConnection, index: number) => ({
          id: `edge-${index}`,
          source: conn.from,
          target: conn.to,
          label: conn.condition,
          animated: true,
        }));

        setInitialNodes(reactFlowNodes);
        setInitialEdges(reactFlowEdges);
      } catch (error) {
        console.error('Failed to fetch workflow:', error);
        toast.error('Failed to load workflow');
        navigate('/app/workflows');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, navigate]);

  const handleSave = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      setIsSaving(true);
      try {
        // Convert React Flow nodes to workflow nodes
        const workflowNodes: WorkflowNode[] = nodes.map((node) => ({
          id: node.id,
          type: node.data.nodeType || 'CUSTOM',
          name: node.data.label || 'Untitled Node',
          config: node.data.config || {},
          position: node.position,
        }));

        // Convert React Flow edges to workflow connections
        const workflowConnections: WorkflowConnection[] = edges.map((edge) => ({
          from: edge.source,
          to: edge.target,
          condition: edge.label as string | undefined,
        }));

        // Find the trigger node (first node or node with trigger type)
        const triggerNode = workflowNodes.find(
          (node) => node.type === 'SCHEDULE' || node.type === 'WEBHOOK' || node.type === 'DATABASE_WATCH'
        ) || workflowNodes[0];

        if (!triggerNode) {
          toast.error('Workflow must have at least one node');
          return;
        }

        const workflowData = {
          name: workflowName,
          description: workflow?.description || '',
          nodes: workflowNodes,
          connections: workflowConnections,
          trigger: triggerNode,
        };

        if (id) {
          // Update existing workflow
          await api.workflows.update(id, workflowData);
          toast.success('Workflow updated successfully');
        } else {
          // Create new workflow
          const response = await api.workflows.create(workflowData) as any;
          const newWorkflowId = response.data._id;

          toast.success('Workflow created successfully');

          // Navigate to the new workflow editor
          navigate(`/app/workflows/${newWorkflowId}`);
        }
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to save workflow');
        console.error('Save error:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [workflowName, workflow, id, navigate]
  );

  // Auto-save function (silent, no toast)
  const performAutoSave = useCallback(async () => {
    if (!id || !autoSaveEnabled || currentNodesRef.current.length === 0) return;

    setIsSaving(true);
    try {
      const workflowNodes: WorkflowNode[] = currentNodesRef.current.map((node) => ({
        id: node.id,
        type: node.data.nodeType || 'CUSTOM',
        name: node.data.label || 'Untitled Node',
        config: node.data.config || {},
        position: node.position,
      }));

      const workflowConnections: WorkflowConnection[] = currentEdgesRef.current.map((edge) => ({
        from: edge.source,
        to: edge.target,
        condition: edge.label as string | undefined,
      }));

      const triggerNode = workflowNodes.find(
        (node) => node.type === 'SCHEDULE' || node.type === 'WEBHOOK' || node.type === 'DATABASE_WATCH'
      ) || workflowNodes[0];

      if (!triggerNode) return;

      const workflowData = {
        name: workflowName,
        description: workflow?.description || '',
        nodes: workflowNodes,
        connections: workflowConnections,
        trigger: triggerNode,
      };

      await api.workflows.update(id, workflowData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [id, autoSaveEnabled, workflowName, workflow]);

  // Handle workflow changes for auto-save
  const handleWorkflowChange = useCallback((nodes: Node[], edges: Edge[]) => {
    currentNodesRef.current = nodes;
    currentEdgesRef.current = edges;
    setHasUnsavedChanges(true);

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new auto-save timer (only for existing workflows)
    if (id && autoSaveEnabled) {
      autoSaveTimerRef.current = setTimeout(() => {
        performAutoSave();
      }, AUTO_SAVE_DELAY);
    }
  }, [id, autoSaveEnabled, performAutoSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleExecute = useCallback(async () => {
    if (!id) {
      toast.error('Please save the workflow before executing');
      return;
    }

    try {
      console.log('Executing workflow:', id);

      // Call the actual API to execute the workflow
      const result = await api.workflows.execute(id, {});

      toast.success('Workflow executed successfully!');
      console.log('Execution result:', result);

      // Refresh workflow data to get updated status
      const updatedWorkflow = await api.workflows.get(id) as any;
      if (updatedWorkflow?.data) {
        setWorkflowName(updatedWorkflow.data.name);
        // The workflow should now be 'active' after first execution
      }
    } catch (error) {
      toast.error('Failed to execute workflow');
      console.error('Execute error:', error);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/app/workflows')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Back to workflows"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2"
              placeholder="Workflow name"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="flex items-center gap-1 text-blue-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-1 text-yellow-500">
                  <CloudOff className="w-4 h-4" />
                  Unsaved
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1 text-green-500">
                  <Cloud className="w-4 h-4" />
                  Saved
                </span>
              ) : null}
            </div>

            {/* Auto-save toggle */}
            {id && (
              <button
                type="button"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                  autoSaveEnabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
                title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
              >
                <Save className="w-3 h-3" />
                Auto
              </button>
            )}

            <span className="text-sm text-gray-500">
              {id ? `Editing: ${id.substring(0, 8)}...` : 'New Workflow'}
            </span>
            {workflow && (
              <>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {workflow.status}
                </span>
                <button
                  type="button"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <WorkflowCanvas
          workflowId={id}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={handleSave}
          onExecute={handleExecute}
          onChange={handleWorkflowChange}
        />
      </div>

      {/* Version History Modal */}
      {showVersionHistory && id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Version History</h2>
              <button
                type="button"
                onClick={() => setShowVersionHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <WorkflowVersionHistory
                workflowId={id}
                onRollback={() => {
                  setShowVersionHistory(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

