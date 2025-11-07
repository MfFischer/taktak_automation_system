import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Node, Edge } from 'reactflow';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import WorkflowCanvas from '../components/workflow/WorkflowCanvas';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);

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
              {id ? `Editing: ${id}` : 'New Workflow'}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <WorkflowCanvas
          workflowId={id}
          onSave={handleSave}
          onExecute={handleExecute}
        />
      </div>
    </div>
  );
}

