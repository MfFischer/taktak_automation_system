/**
 * Workflow Version History Component
 * View, compare, and rollback workflow versions
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface WorkflowVersion {
  _id: string;
  version: number;
  createdAt: string;
  createdBy?: string;
  changeDescription?: string;
  snapshot: any;
}

interface Props {
  workflowId: string;
  onRollback?: (version: WorkflowVersion) => void;
}

export const WorkflowVersionHistory: React.FC<Props> = ({ workflowId, onRollback }) => {
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);

  useEffect(() => {
    loadVersions();
  }, [workflowId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await api.workflows.listVersions(workflowId) as any;
      setVersions(response.data || []);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (version: WorkflowVersion) => {
    if (!confirm(`Are you sure you want to rollback to version ${version.version}?`)) {
      return;
    }

    try {
      await api.workflows.rollbackToVersion(workflowId, version._id);
      alert('Workflow rolled back successfully!');
      if (onRollback) {
        onRollback(version);
      }
      loadVersions();
    } catch (error) {
      console.error('Failed to rollback:', error);
      alert('Failed to rollback workflow');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Version History</h2>
        <span className="text-sm text-gray-500">{versions.length} versions</span>
      </div>

      <div className="space-y-4">
        {versions.map((version, index) => (
          <div
            key={version._id}
            className={`border rounded-lg p-4 transition-all ${
              selectedVersion?._id === version._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    v{version.version}
                  </span>
                  {index === 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  {version.changeDescription || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatDate(version.createdAt)}</span>
                  {version.createdBy && <span>by {version.createdBy}</span>}
                  <span>{version.snapshot.nodes?.length || 0} nodes</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVersion(version)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  View
                </button>
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleRollback(version)}
                    className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors"
                  >
                    Rollback
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {versions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No version history available</p>
          </div>
        )}
      </div>

      {/* Version Details Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Version {selectedVersion.version} Details</h3>
                <button
                  type="button"
                  onClick={() => setSelectedVersion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(selectedVersion.snapshot, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

