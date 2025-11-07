import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Workflows() {
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

      {/* Empty state */}
      <div className="card text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No workflows yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get started by creating your first workflow
        </p>
        <Link to="/app/workflows/new" className="btn btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Workflow
        </Link>
      </div>
    </div>
  );
}

