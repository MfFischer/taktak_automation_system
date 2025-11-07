import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Node, Edge } from 'reactflow';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import { api } from '../services/api';

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
        // TODO: Implement API call to save workflow
        console.log('Saving workflow:', { name: workflowName, nodes, edges });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success('Workflow saved successfully');
      } catch (error) {
        toast.error('Failed to save workflow');
        console.error('Save error:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [workflowName]
  );

  const handleExecute = useCallback(async () => {
    try {
      // TODO: Implement API call to execute workflow
      console.log('Executing workflow:', id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success('Workflow execution started');
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
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            <span className="text-sm text-gray-500">
              {id ? `Editing: ${id.substring(0, 20)}...` : 'New Workflow'}
            </span>
            {workflow && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {workflow.status}
              </span>
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
        />
      </div>
    </div>
  );
}

