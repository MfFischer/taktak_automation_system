/**
 * Node Execution Configuration Panel
 * Configure retry, timeout, and error handling for nodes
 */

import React, { useState } from 'react';

export interface NodeExecutionConfig {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  continueOnError?: boolean;
  parallel?: boolean;
}

interface Props {
  config: NodeExecutionConfig;
  onChange: (config: NodeExecutionConfig) => void;
}

export const NodeExecutionConfigPanel: React.FC<Props> = ({ config, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const updateConfig = (updates: Partial<NodeExecutionConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">⚙️ Execution Configuration</span>
          {(config.retries || config.continueOnError) && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Retry Configuration */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Retry Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.retries || 0}
                  onChange={(e) => updateConfig({ retries: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Number of retry attempts (0-10)</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Retry Delay (ms)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={config.retryDelay || 1000}
                  onChange={(e) => updateConfig({ retryDelay: parseInt(e.target.value) || 1000 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!config.retries}
                />
                <p className="text-xs text-gray-500 mt-1">Delay between retries</p>
              </div>
            </div>
          </div>

          {/* Timeout Configuration */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Timeout Settings</h4>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Execution Timeout (ms)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={config.timeout || 30000}
                onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 30000 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum execution time (default: 30000ms)
              </p>
            </div>
          </div>

          {/* Error Handling */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Error Handling</h4>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.continueOnError || false}
                onChange={(e) => updateConfig({ continueOnError: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">Continue on Error</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Continue workflow execution even if this node fails
                </p>
              </div>
            </label>
          </div>

          {/* Parallel Execution */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Performance</h4>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.parallel || false}
                onChange={(e) => updateConfig({ parallel: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">Parallel Execution</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allow this node to execute in parallel with sibling nodes
                </p>
              </div>
            </label>
          </div>

          {/* Preset Buttons */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Quick Presets:</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateConfig({ retries: 3, retryDelay: 2000, timeout: 30000 })}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                🔄 Resilient
              </button>
              <button
                onClick={() => updateConfig({ timeout: 5000, continueOnError: true })}
                className="px-3 py-1 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
              >
                ⚡ Fast & Forgiving
              </button>
              <button
                onClick={() => updateConfig({ retries: 0, timeout: 30000, continueOnError: false })}
                className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                🎯 Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

