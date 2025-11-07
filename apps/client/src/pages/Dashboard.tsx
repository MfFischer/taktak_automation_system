import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      name: 'Active Workflows',
      value: '0',
      icon: Activity,
      color: 'taktak',
      gradient: 'from-taktak-500 to-taktak-600',
      delay: '0ms'
    },
    {
      name: 'Successful Runs',
      value: '0',
      icon: CheckCircle,
      color: 'success',
      gradient: 'from-success-500 to-success-600',
      delay: '100ms'
    },
    {
      name: 'Failed Runs',
      value: '0',
      icon: XCircle,
      color: 'error',
      gradient: 'from-error-500 to-error-600',
      delay: '200ms'
    },
    {
      name: 'Pending',
      value: '0',
      icon: Clock,
      color: 'warning',
      gradient: 'from-warning-500 to-warning-600',
      delay: '300ms'
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-down">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <TrendingUp className="w-8 h-8 text-taktak-500 animate-bounce-subtle" />
        </div>
        <p className="text-lg text-gray-400">
          Welcome to <span className="text-gradient font-semibold">Taktak</span> - Your offline-first automation platform ⚡
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="card-interactive animate-fade-in-up"
            style={{ animationDelay: stat.delay }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-2">
                  {stat.name}
                </p>
                <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>+0% from last week</span>
                </div>
              </div>
              <div className={`relative group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 border border-${stat.color}-500/20`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Getting Started */}
      <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-taktak rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Getting Started
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              step: 1,
              title: 'Create your first workflow',
              description: 'Use the AI Assistant or manually build a workflow to automate your tasks',
              icon: '🚀',
              action: () => navigate('/app/workflows/new')
            },
            {
              step: 2,
              title: 'Configure your integrations',
              description: 'Add API keys for Twilio, Gmail, and other services in Settings',
              icon: '🔌',
              action: () => navigate('/app/settings')
            },
            {
              step: 3,
              title: 'Enable cloud sync (optional)',
              description: 'Sync your workflows to the cloud for backup and team collaboration',
              icon: '☁️',
              action: () => navigate('/app/settings')
            }
          ].map((item) => (
            <button
              key={item.step}
              onClick={item.action}
              className="w-full flex items-start group hover:translate-x-2 transition-transform duration-300 text-left"
            >
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 bg-gradient-taktak rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dark-elevated border-2 border-taktak-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-taktak-400">{item.step}</span>
                </div>
              </div>
              <div className="ml-5 flex-1">
                <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-taktak-400 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-8 pt-6 border-t border-dark-border">
          <button
            type="button"
            onClick={() => navigate('/app/workflows/new')}
            className="btn btn-primary w-full group"
          >
            <span>Start Building</span>
            <Activity className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

