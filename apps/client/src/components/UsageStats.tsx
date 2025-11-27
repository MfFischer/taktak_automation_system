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
      const response = await api.get<{ success: boolean; data: UsageData }>('/api/auth/usage');
      // API returns { success: true, data: {...} }
      if (response.success && response.data) {
        setUsageData(response.data);
        setError(null);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load usage data');
      console.error('Error fetching usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-dark-border rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-dark-border rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className="bg-error-500/10 border border-error-500/30 rounded-lg p-4">
        <p className="text-error-400">{error || 'Failed to load usage data'}</p>
      </div>
    );
  }

  // Provide default values if any field is undefined
  const tier = usageData.tier || UserTier.FREE;
  const usage = usageData.usage || {
    executionsThisMonth: 0,
    executionsLastReset: new Date().toISOString(),
    activeWorkflows: 0,
  };
  const limits = usageData.limits || {
    executionsPerMonth: 100,
    maxActiveWorkflows: 3,
    features: {
      cloudSync: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customIntegrations: false,
      teamWorkspaces: false,
      whiteLabel: false,
      sso: false,
    },
  };
  const percentUsed = usageData.percentUsed || {
    executions: 0,
    workflows: 0,
  };
  const isUnlimited = (value: number) => value === -1;

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Usage & Limits</h2>
        <span className="px-3 py-1 bg-taktak-500/20 text-taktak-400 rounded-full text-sm font-semibold uppercase">
          {tier}
        </span>
      </div>

      {/* Executions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Workflow Executions</span>
          <span className="text-sm text-gray-400">
            {usage.executionsThisMonth} / {isUnlimited(limits.executionsPerMonth) ? '∞' : limits.executionsPerMonth}
          </span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentUsed.executions >= 90 ? 'bg-error-500' : percentUsed.executions >= 70 ? 'bg-warning-500' : 'bg-success-500'
            }`}
            style={{ width: `${Math.min(percentUsed.executions, 100)}%` }}
          ></div>
        </div>
        {percentUsed.executions >= 80 && !isUnlimited(limits.executionsPerMonth) && (
          <p className="text-xs text-warning-400 mt-1">You're approaching your monthly limit</p>
        )}
      </div>

      {/* Active Workflows */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Active Workflows</span>
          <span className="text-sm text-gray-400">
            {usage.activeWorkflows} / {isUnlimited(limits.maxActiveWorkflows) ? '∞' : limits.maxActiveWorkflows}
          </span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentUsed.workflows >= 90 ? 'bg-error-500' : percentUsed.workflows >= 70 ? 'bg-warning-500' : 'bg-success-500'
            }`}
            style={{ width: `${Math.min(percentUsed.workflows, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {(percentUsed.executions >= 80 || percentUsed.workflows >= 80) && tier === UserTier.FREE && (
        <div className="bg-taktak-500/10 border border-taktak-500/30 rounded-lg p-4 mt-4">
          <p className="text-sm text-taktak-300 mb-2">Need more capacity?</p>
          <a
            href="/pricing"
            className="btn btn-primary text-sm"
          >
            Upgrade Plan
          </a>
        </div>
      )}
    </div>
  );
};

