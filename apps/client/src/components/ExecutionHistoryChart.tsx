/**
 * Execution History Chart Component
 * Displays workflow execution trends over time
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';

interface ExecutionData {
  date: string;
  success: number;
  failed: number;
  total: number;
}

export const ExecutionHistoryChart: React.FC = () => {
  const [data, setData] = useState<ExecutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalExecutions: 0, successRate: 0, trend: 0 });

  useEffect(() => {
    fetchExecutionHistory();
  }, []);

  const fetchExecutionHistory = async () => {
    try {
      setLoading(true);
      // Fetch executions from last 7 days
      const response = await api.get<any>('/api/executions?limit=100');
      const executions = response.data || [];

      // Group by date
      const grouped = groupExecutionsByDate(executions);
      setData(grouped);

      // Calculate stats
      const total = executions.length;
      const successful = executions.filter((e: any) => e.status === 'success').length;
      const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

      // Calculate trend (compare last 3 days vs previous 3 days)
      const trend = calculateTrend(grouped);

      setStats({ totalExecutions: total, successRate, trend });
    } catch (error) {
      console.error('Error fetching execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupExecutionsByDate = (executions: any[]): ExecutionData[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const grouped: Record<string, ExecutionData> = {};
    last7Days.forEach(date => {
      grouped[date] = { date, success: 0, failed: 0, total: 0 };
    });

    executions.forEach((exec: any) => {
      const date = new Date(exec.startedAt).toISOString().split('T')[0];
      if (grouped[date]) {
        grouped[date].total++;
        if (exec.status === 'success') {
          grouped[date].success++;
        } else if (exec.status === 'failed') {
          grouped[date].failed++;
        }
      }
    });

    return Object.values(grouped);
  };

  const calculateTrend = (data: ExecutionData[]): number => {
    if (data.length < 6) return 0;
    const recent = data.slice(-3).reduce((sum, d) => sum + d.total, 0);
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.total, 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - previous) / previous) * 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const maxValue = Math.max(...data.map(d => d.total), 1);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Execution History</h2>
          <p className="text-sm text-gray-600 mt-1">Last 7 days</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{stats.totalExecutions}</div>
          <div className="flex items-center justify-end space-x-1 text-sm">
            {stats.trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(stats.trend)}%
            </span>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.date} className="flex items-center space-x-3">
            <div className="w-16 text-xs text-gray-600">{formatDate(item.date)}</div>
            <div className="flex-1 flex items-center space-x-1">
              <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden flex">
                {item.success > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(item.success / maxValue) * 100}%` }}
                  >
                    {item.success > 0 && <span className="px-2">{item.success}</span>}
                  </div>
                )}
                {item.failed > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(item.failed / maxValue) * 100}%` }}
                  >
                    {item.failed > 0 && <span className="px-2">{item.failed}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Success ({stats.successRate}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Failed ({100 - stats.successRate}%)</span>
        </div>
      </div>
    </div>
  );
};

