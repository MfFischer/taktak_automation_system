import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { X, Calendar, Clock, Database, Globe, MessageSquare, Mail, Sparkles } from 'lucide-react';
import { NodeType } from '@taktak/types';
import { NodeExecutionConfigPanel, NodeExecutionConfig } from '../NodeExecutionConfigPanel';
import { LoopNodeConfigPanel } from '../LoopNodeConfig';
import { ErrorHandlingConfig } from '../ErrorHandlingConfig';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (nodeId: string, config: any) => void;
}

export default function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');
  const [executionConfig, setExecutionConfig] = useState<NodeExecutionConfig>(node.data.executionConfig || {});
  const [errorConfig, setErrorConfig] = useState(node.data.errorConfig || { enabled: false });

  useEffect(() => {
    setConfig(node.data.config || {});
    setLabel(node.data.label || '');
    setExecutionConfig(node.data.executionConfig || {});
    setErrorConfig(node.data.errorConfig || { enabled: false });
  }, [node]);

  const handleSave = () => {
    onUpdate(node.id, {
      ...config,
      label,
      executionConfig,
      errorConfig
    });
    onClose();
  };

  const renderConfigFields = () => {
    const nodeType = node.data.nodeType as NodeType;

    switch (nodeType) {
      case NodeType.SCHEDULE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Schedule Type
              </label>
              <select
                value={config.scheduleType || 'cron'}
                onChange={(e) => setConfig({ ...config, scheduleType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="cron">Cron Expression</option>
                <option value="interval">Interval</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {config.scheduleType === 'cron' && (
              <div>
                <label className="block text-sm font-medium mb-2">Cron Expression</label>
                <input
                  type="text"
                  value={config.cron || '0 9 * * *'}
                  onChange={(e) => setConfig({ ...config, cron: e.target.value })}
                  placeholder="0 9 * * * (9 AM daily)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: minute hour day month weekday
                </p>
              </div>
            )}

            {config.scheduleType === 'interval' && (
              <div>
                <label className="block text-sm font-medium mb-2">Interval (minutes)</label>
                <input
                  type="number"
                  value={config.interval || 60}
                  onChange={(e) => setConfig({ ...config, interval: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}

            {config.scheduleType === 'daily' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  value={config.time || '09:00'}
                  onChange={(e) => setConfig({ ...config, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}

            {config.scheduleType === 'weekly' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Day of Week</label>
                  <select
                    value={config.dayOfWeek || '1'}
                    onChange={(e) => setConfig({ ...config, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={config.time || '09:00'}
                    onChange={(e) => setConfig({ ...config, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </>
            )}
          </div>
        );

      case NodeType.SEND_SMS:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="text"
                value={config.to || ''}
                onChange={(e) => setConfig({ ...config, to: e.target.value })}
                placeholder="{{item.patient_phone}} or +1234567890"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{{'} {'}'} for dynamic values from previous nodes
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Hi {{item.name}}, your appointment is tomorrow at {{item.time}}"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        );

      case NodeType.SEND_EMAIL:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                To Email
              </label>
              <input
                type="text"
                value={config.to || ''}
                onChange={(e) => setConfig({ ...config, to: e.target.value })}
                placeholder="{{item.email}} or user@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                placeholder="Appointment Reminder"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Dear {{item.name}}, this is a reminder..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        );

      case NodeType.DATABASE_QUERY:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Database className="w-4 h-4 inline mr-2" />
                Database
              </label>
              <input
                type="text"
                value={config.database || ''}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder="clinic_db"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SQL Query</label>
              <textarea
                value={config.query || ''}
                onChange={(e) => setConfig({ ...config, query: e.target.value })}
                placeholder="SELECT * FROM appointments WHERE date = CURDATE()"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
          </div>
        );

      case NodeType.HTTP_REQUEST:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Method
              </label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => setConfig({ ...config, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <input
                type="text"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Headers (JSON)</label>
              <textarea
                value={config.headers || ''}
                onChange={(e) => setConfig({ ...config, headers: e.target.value })}
                placeholder='{"Authorization": "Bearer token"}'
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
              />
            </div>
            {(config.method === 'POST' || config.method === 'PUT') && (
              <div>
                <label className="block text-sm font-medium mb-2">Body (JSON)</label>
                <textarea
                  value={config.body || ''}
                  onChange={(e) => setConfig({ ...config, body: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                />
              </div>
            )}
          </div>
        );

      case NodeType.AI_GENERATE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Sparkles className="w-4 h-4 inline mr-2" />
                AI Model
              </label>
              <select
                value={config.model || 'gemini'}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openrouter">OpenRouter</option>
                <option value="local">Local (Phi-3)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                placeholder="Generate a professional email response to: {{item.message}}"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No configuration available for this node type.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configure Node</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Node Label */}
        <div>
          <label className="block text-sm font-medium mb-2">Node Name</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>

        {/* Node Type Badge */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Type:</span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
            {node.data.nodeType}
          </span>
        </div>

        {/* Configuration Fields */}
        <div>
          <h3 className="text-sm font-medium mb-3">Configuration</h3>
          {renderConfigFields()}
        </div>

        {/* Loop Node Configuration */}
        {node.data.nodeType === NodeType.LOOP && (
          <div className="mt-4">
            <LoopNodeConfigPanel
              config={config}
              onChange={(newConfig) => setConfig(newConfig)}
            />
          </div>
        )}

        {/* Execution Configuration */}
        <div className="mt-4">
          <NodeExecutionConfigPanel
            config={executionConfig}
            onChange={setExecutionConfig}
          />
        </div>

        {/* Error Handling Configuration */}
        {node.data.nodeType === NodeType.ERROR_TRIGGER && (
          <div className="mt-4">
            <ErrorHandlingConfig
              config={errorConfig}
              onChange={setErrorConfig}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="flex-1 btn btn-primary"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

