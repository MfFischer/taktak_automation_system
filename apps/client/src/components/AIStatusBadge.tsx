/**
 * AI Status Badge Component
 * Shows which AI provider is currently being used
 * Color-coded for easy identification
 */

import React from 'react';
import { Sparkles, Zap, Cpu, Clock } from 'lucide-react';

export type AIProvider = 'gemini' | 'openrouter' | 'phi3' | 'queued';

interface AIStatusBadgeProps {
  provider: AIProvider;
  className?: string;
}

const providerConfig = {
  gemini: {
    label: 'Gemini',
    color: 'bg-green-500',
    textColor: 'text-white',
    icon: Sparkles,
    description: 'Cloud AI - Fastest',
  },
  openrouter: {
    label: 'OpenRouter',
    color: 'bg-blue-500',
    textColor: 'text-white',
    icon: Zap,
    description: 'Cloud AI - Fallback',
  },
  phi3: {
    label: 'Phi-3',
    color: 'bg-yellow-500',
    textColor: 'text-white',
    icon: Cpu,
    description: 'Local AI - Offline',
  },
  queued: {
    label: 'Queued',
    color: 'bg-gray-500',
    textColor: 'text-white',
    icon: Clock,
    description: 'Waiting for connection',
  },
};

export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({ provider, className = '' }) => {
  const config = providerConfig[provider];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} ${config.textColor} ${className}`}
      title={config.description}
    >
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">AI: {config.label}</span>
    </div>
  );
};

interface AIStatusIndicatorProps {
  provider: AIProvider;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  provider,
  showLabel = true,
  size = 'md',
}) => {
  const config = providerConfig[provider];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full ${config.color} flex items-center justify-center`}
        title={config.description}
      >
        <Icon className={`${iconSizes[size]} ${config.textColor}`} />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{config.label}</span>
          <span className="text-xs text-gray-500">{config.description}</span>
        </div>
      )}
    </div>
  );
};

export default AIStatusBadge;

