/**
 * Error Handling Configuration Component
 * Configure error triggers, notifications, and error handling strategies
 */

import React, { useState } from 'react';

export interface ErrorTriggerConfig {
  enabled: boolean;
  errorTypes?: string[];
  notifyEmail?: string;
  notifySMS?: string;
  notifySlack?: string;
  retryOnError?: boolean;
  maxRetries?: number;
  customHandler?: string;
}

interface Props {
  config: ErrorTriggerConfig;
  onChange: (config: ErrorTriggerConfig) => void;
}

export const ErrorHandlingConfig: React.FC<Props> = ({ config, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (updates: Partial<ErrorTriggerConfig>) => {
    onChange({ ...config, ...updates });
  };

  const toggleErrorType = (errorType: string) => {
    const currentTypes = config.errorTypes || [];
    const newTypes = currentTypes.includes(errorType)
      ? currentTypes.filter(t => t !== errorType)
      : [...currentTypes, errorType];
    updateConfig({ errorTypes: newTypes });
  };

  const errorTypes = [
    { value: 'validation', label: 'Validation Errors', icon: '⚠️' },
    { value: 'network', label: 'Network Errors', icon: '🌐' },
    { value: 'timeout', label: 'Timeout Errors', icon: '⏱️' },
    { value: 'authentication', label: 'Auth Errors', icon: '🔐' },
    { value: 'rate_limit', label: 'Rate Limit Errors', icon: '🚦' },
    { value: 'server', label: 'Server Errors (5xx)', icon: '🔥' },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Error Handling Configuration</h3>
            <p className="text-sm text-gray-500">Configure how errors are handled and reported</p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateConfig({ enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Enable Error Handling</span>
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Error Types */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Trigger On Error Types</h4>
            <div className="grid grid-cols-2 gap-3">
              {errorTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    config.errorTypes?.includes(type.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config.errorTypes?.includes(type.value) || false}
                    onChange={() => toggleErrorType(type.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Notifications</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  📧 Email Notification
                </label>
                <input
                  type="email"
                  value={config.notifyEmail || ''}
                  onChange={(e) => updateConfig({ notifyEmail: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  📱 SMS Notification
                </label>
                <input
                  type="tel"
                  value={config.notifySMS || ''}
                  onChange={(e) => updateConfig({ notifySMS: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  💬 Slack Webhook URL
                </label>
                <input
                  type="url"
                  value={config.notifySlack || ''}
                  onChange={(e) => updateConfig({ notifySlack: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>{showAdvanced ? '▼' : '▶'}</span>
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.retryOnError || false}
                    onChange={(e) => updateConfig({ retryOnError: e.target.checked })}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Retry on Error</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Automatically retry failed operations
                    </p>
                  </div>
                </label>

                {config.retryOnError && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Retry Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={config.maxRetries || 3}
                      onChange={(e) => updateConfig({ maxRetries: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

