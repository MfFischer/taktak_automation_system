/**
 * Loop Node Configuration Component
 * Configure loop/iteration settings with expression support
 */

import React, { useState } from 'react';

export interface LoopNodeConfig {
  items: string | unknown[];
  batchSize?: number;
  maxIterations?: number;
  continueOnItemError?: boolean;
}

interface Props {
  config: LoopNodeConfig;
  onChange: (config: LoopNodeConfig) => void;
}

export const LoopNodeConfigPanel: React.FC<Props> = ({ config, onChange }) => {
  const [itemsMode, setItemsMode] = useState<'expression' | 'array'>(
    typeof config.items === 'string' ? 'expression' : 'array'
  );

  const updateConfig = (updates: Partial<LoopNodeConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔄</span>
        <h3 className="text-lg font-semibold text-gray-800">Loop Configuration</h3>
      </div>

      {/* Items Source */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Items to Iterate
        </label>

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setItemsMode('expression')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              itemsMode === 'expression'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expression
          </button>
          <button
            onClick={() => setItemsMode('array')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              itemsMode === 'array'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Array
          </button>
        </div>

        {itemsMode === 'expression' ? (
          <div>
            <input
              type="text"
              value={typeof config.items === 'string' ? config.items : ''}
              onChange={(e) => updateConfig({ items: e.target.value })}
              placeholder="{{$json.items}} or {{$node.previousNode}}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use expressions like <code className="bg-gray-100 px-1 rounded">{'{{$json.items}}'}</code> or{' '}
              <code className="bg-gray-100 px-1 rounded">{'{{$node.previousNode}}'}</code>
            </p>
          </div>
        ) : (
          <div>
            <textarea
              value={Array.isArray(config.items) ? JSON.stringify(config.items, null, 2) : '[]'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateConfig({ items: parsed });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='["item1", "item2", "item3"]'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a JSON array of items to iterate over
            </p>
          </div>
        )}
      </div>

      {/* Batch Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Batch Size (Optional)
        </label>
        <input
          type="number"
          min="1"
          value={config.batchSize || ''}
          onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) || undefined })}
          placeholder="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Process items in batches (default: 1 item at a time)
        </p>
      </div>

      {/* Max Iterations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Iterations
        </label>
        <input
          type="number"
          min="1"
          value={config.maxIterations || 1000}
          onChange={(e) => updateConfig({ maxIterations: parseInt(e.target.value) || 1000 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Safety limit to prevent infinite loops (default: 1000)
        </p>
      </div>

      {/* Continue on Item Error */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.continueOnItemError || false}
            onChange={(e) => updateConfig({ continueOnItemError: e.target.checked })}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm text-gray-700 font-medium">Continue on Item Error</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Continue processing remaining items even if one fails
            </p>
          </div>
        </label>
      </div>

      {/* Loop Variables Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-900 mb-2">Available Loop Variables:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div><code className="bg-blue-100 px-1 rounded">$item</code> - Current item</div>
          <div><code className="bg-blue-100 px-1 rounded">$index</code> - Current index (0-based)</div>
          <div><code className="bg-blue-100 px-1 rounded">$iteration</code> - Current iteration (1-based)</div>
          <div><code className="bg-blue-100 px-1 rounded">$length</code> - Total items</div>
          <div><code className="bg-blue-100 px-1 rounded">$isFirst</code> - Is first item</div>
          <div><code className="bg-blue-100 px-1 rounded">$isLast</code> - Is last item</div>
        </div>
      </div>
    </div>
  );
};

