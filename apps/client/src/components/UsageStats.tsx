/**
 * Usage Stats Component
 * Displays user's current usage and tier limits
 */

import React, { useEffect, useState } from 'react';
import { UserTier, UsageStats as UsageStatsType } from '@taktak/types';
import { api } from '../services/api';

interface TierLimits {
  executionsPerMonth: number;
  maxActiveWorkflows: number;
  features: {
    cloudSync: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    teamWorkspaces: boolean;
    whiteLabel: boolean;
    sso: boolean;
  };
}

interface UsageData {
  tier: UserTier;
  usage: UsageStatsType;
  limits: TierLimits;
  percentUsed: {
    executions: number;
    workflows: number;
  };
}

export const UsageStats: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await api.get<UsageData>('/api/auth/usage');
      setUsageData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load usage data');
      console.error('Error fetching usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'Failed to load usage data'}</p>
      </div>
    );
  }

  const { tier, usage, limits, percentUsed } = usageData;
  const isUnlimited = (value: number) => value === -1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Usage & Limits</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold uppercase">
          {tier}
        </span>
      </div>

      {/* Executions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Workflow Executions</span>
          <span className="text-sm text-gray-600">
            {usage.executionsThisMonth} / {isUnlimited(limits.executionsPerMonth) ? '∞' : limits.executionsPerMonth}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentUsed.executions >= 90 ? 'bg-red-500' : percentUsed.executions >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentUsed.executions, 100)}%` }}
          ></div>
        </div>
        {percentUsed.executions >= 80 && !isUnlimited(limits.executionsPerMonth) && (
          <p className="text-xs text-orange-600 mt-1">You're approaching your monthly limit</p>
        )}
      </div>

      {/* Active Workflows */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Active Workflows</span>
          <span className="text-sm text-gray-600">
            {usage.activeWorkflows} / {isUnlimited(limits.maxActiveWorkflows) ? '∞' : limits.maxActiveWorkflows}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentUsed.workflows >= 90 ? 'bg-red-500' : percentUsed.workflows >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentUsed.workflows, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {(percentUsed.executions >= 80 || percentUsed.workflows >= 80) && tier === UserTier.FREE && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800 mb-2">Need more capacity?</p>
          <a
            href="/pricing"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Upgrade Plan
          </a>
        </div>
      )}
    </div>
  );
};

