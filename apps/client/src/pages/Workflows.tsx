import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Pause, Trash2, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'error';
  createdAt: string;
  updatedAt: string;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.workflows.list();
      // Handle both response formats: data.workflows or data (array)
      const workflowsData = Array.isArray(response.data) ? response.data : response.data.workflows || [];
      setWorkflows(workflowsData);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await api.workflows.delete(id);
      setWorkflows(workflows.filter(w => w._id !== id));
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      alert('Failed to delete workflow');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflows</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your automation workflows
          </p>
        </div>
        <Link to="/app/workflows/new" className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Workflow
        </Link>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workflows...</p>
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to load workflows
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={fetchWorkflows} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : workflows.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workflows yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first workflow or import a template
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/app/workflows/new" className="btn btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Workflow
            </Link>
            <Link to="/app/templates" className="btn btn-secondary inline-flex items-center">
              Import Template
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {workflows.map((workflow) => (
            <div key={workflow._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(workflow.status)}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {workflow.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  {workflow.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {workflow.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/workflows/${workflow._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit workflow"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(workflow._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete workflow"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

