import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles,
  Workflow, Bot, Cloud, Lock, Mail, LogIn,
  Loader2, Github, Twitter, Linkedin,
  Zap, Shield, Clock, Server, Cpu, Globe,
  FileSpreadsheet, MessageSquare, Calendar, CreditCard,
  Play, CheckCircle2, ChevronRight, Star,
  Database, Bell, Users, ShoppingCart, FileText, BarChart3
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/app');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Workflow,
      title: 'Visual Workflow Builder',
      description: 'Drag-and-drop interface to create powerful automation workflows without coding',
      gradient: 'from-taktak-500 to-accent-500',
      delay: '0ms'
    },
    {
      icon: Bot,
      title: 'AI-Powered Assistant',
      description: 'Describe your workflow in plain English and let AI build it for you',
      gradient: 'from-accent-500 to-taktak-600',
      delay: '100ms'
    },
    {
      icon: Cloud,
      title: 'Offline-First Architecture',
      description: 'Work seamlessly offline with automatic cloud sync when connected',
      gradient: 'from-taktak-600 to-accent-400',
      delay: '200ms'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security for your sensitive business data',
      gradient: 'from-accent-400 to-taktak-500',
      delay: '300ms'
    },
  ];

  // Sample workflows for showcase
  const sampleWorkflows = [
    {
      id: 'lead-capture',
      name: 'Lead Capture to CRM',
      description: 'Automatically capture leads from forms and add them to your CRM with AI enrichment',
      icon: FileSpreadsheet,
      category: 'Sales',
      nodes: ['Webhook', 'AI Enrich', 'Google Sheets', 'Slack Notify'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'customer-support',
      name: 'AI Customer Support',
      description: 'Intelligent ticket routing with AI-powered responses and escalation',
      icon: MessageSquare,
      category: 'Support',
      nodes: ['Email Trigger', 'AI Classify', 'Condition', 'Auto Reply'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'invoice-automation',
      name: 'Invoice Processing',
      description: 'Extract data from invoices, validate, and sync to accounting software',
      icon: CreditCard,
      category: 'Finance',
      nodes: ['File Upload', 'AI Extract', 'Validate', 'QuickBooks'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'social-scheduler',
      name: 'Social Media Scheduler',
      description: 'AI-generated content scheduled across multiple platforms',
      icon: Calendar,
      category: 'Marketing',
      nodes: ['Schedule', 'AI Generate', 'Twitter', 'LinkedIn'],
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'data-sync',
      name: 'Database Sync',
      description: 'Keep multiple databases in sync with real-time change detection',
      icon: Database,
      category: 'IT Ops',
      nodes: ['DB Trigger', 'Transform', 'Postgres', 'MySQL'],
      color: 'from-indigo-500 to-violet-500',
    },
    {
      id: 'alert-system',
      name: 'Smart Alert System',
      description: 'Monitor KPIs and send AI-contextualized alerts to the right team',
      icon: Bell,
      category: 'Operations',
      nodes: ['Metric Poll', 'AI Analyze', 'Condition', 'Multi-Notify'],
      color: 'from-yellow-500 to-amber-500',
    },
    {
      id: 'onboarding',
      name: 'Employee Onboarding',
      description: 'Automate new hire setup across HR, IT, and communication tools',
      icon: Users,
      category: 'HR',
      nodes: ['Form Submit', 'Create Accounts', 'Send Welcome', 'Schedule Training'],
      color: 'from-teal-500 to-cyan-500',
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Order Flow',
      description: 'Process orders, update inventory, and notify customers automatically',
      icon: ShoppingCart,
      category: 'E-commerce',
      nodes: ['Order Webhook', 'Inventory Check', 'Payment', 'Ship Notify'],
      color: 'from-rose-500 to-pink-500',
    },
    {
      id: 'document-gen',
      name: 'Document Generation',
      description: 'Generate contracts, reports, and documents from templates with AI',
      icon: FileText,
      category: 'Legal',
      nodes: ['Data Input', 'AI Fill', 'PDF Generate', 'Email Send'],
      color: 'from-slate-500 to-gray-600',
    },
    {
      id: 'analytics',
      name: 'Analytics Pipeline',
      description: 'Aggregate data from multiple sources into unified dashboards',
      icon: BarChart3,
      category: 'Analytics',
      nodes: ['Multi-Source', 'Transform', 'Aggregate', 'Dashboard Push'],
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  // 4-Tier AI Failover system
  const aiTiers = [
    {
      tier: 1,
      name: 'Gemini Pro',
      speed: '0.8s',
      description: 'Primary AI - Google\'s fastest model',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      status: 'primary',
    },
    {
      tier: 2,
      name: 'OpenRouter',
      speed: '1.2s',
      description: 'Fallback - Multi-model routing',
      icon: Globe,
      color: 'from-purple-500 to-purple-600',
      status: 'fallback',
    },
    {
      tier: 3,
      name: 'Phi-3 Local',
      speed: '1.5s',
      description: 'Offline - Runs on your device',
      icon: Cpu,
      color: 'from-green-500 to-green-600',
      status: 'offline',
    },
    {
      tier: 4,
      name: 'Smart Queue',
      speed: 'Async',
      description: 'Never fails - Queued for later',
      icon: Server,
      color: 'from-orange-500 to-orange-600',
      status: 'queue',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-taktak-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-taktak-600/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-dark-border backdrop-blur-xl bg-dark-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <img src="/logo.png" alt="Taktak" className="w-10 h-10 object-contain" />
                <div className="absolute inset-0 blur-xl bg-taktak-500/30 animate-pulse-glow"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Taktak</h1>
                <p className="text-xs text-gray-400">Shake off the manual work</p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300">Features</a>
              <a href="#workflows" className="text-gray-300 hover:text-white transition-colors duration-300">Templates</a>
              <button
                type="button"
                onClick={() => navigate('/desktop')}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Desktop App
              </button>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Pricing
              </button>
              <a href="https://github.com/MfFischer/taktak#readme" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-300">Docs</a>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="btn btn-ghost"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-taktak-500/10 border border-taktak-500/30 animate-bounce-subtle">
                <Sparkles className="w-4 h-4 text-taktak-400" />
                <span className="text-sm text-taktak-300 font-medium">AI-Powered Automation Platform</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="text-white">Automate</span>
                <br />
                <span className="text-gradient">Everything</span>
                <br />
                <span className="text-white">Effortlessly</span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                Build powerful automation workflows with our visual editor or AI assistant. 
                Work offline, sync to cloud, and scale your business without limits.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="btn btn-primary text-lg px-8 py-4 group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  Sign In
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-dark-border">
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <div className="text-3xl font-bold text-gradient">10+</div>
                  <div className="text-sm text-gray-400">Node Types</div>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <div className="text-3xl font-bold text-gradient">100%</div>
                  <div className="text-sm text-gray-400">Offline Support</div>
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <div className="text-3xl font-bold text-gradient">∞</div>
                  <div className="text-sm text-gray-400">Possibilities</div>
                </div>
              </div>
            </div>

            {/* Right: Login Form */}
            <div id="login-section" className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="card-elevated max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-taktak mb-4 shadow-glow">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-400">Sign in to continue to Taktak</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-error-500/10 border border-error-500/30 animate-fade-in">
                    <p className="text-error-300 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Email address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-taktak-400 transition-colors duration-300" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input pl-12"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-taktak-400 transition-colors duration-300" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input pl-12"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full text-lg py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <Sparkles className="w-4 h-4 ml-2 opacity-70" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="font-semibold text-gradient hover:opacity-80 transition-opacity duration-300"
                    >
                      Sign up for free
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6 border-t border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-5xl font-bold text-white mb-6">
              Everything you need to <span className="text-gradient">automate</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powerful features designed for modern businesses. Build, deploy, and scale your automation workflows with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-interactive animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-glow`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                <button
                  onClick={() => navigate('/signup')}
                  className="mt-6 flex items-center text-taktak-400 font-medium group hover:text-taktak-300 transition-colors"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Tier AI Failover Section - UNIQUE SELLING POINT */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-dark-bg to-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300 font-medium">99.9% Uptime Guarantee</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              <span className="text-gradient">4-Tier AI Failover</span> System
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Unlike Zapier, Make, or n8n - Taktak never fails. Our intelligent failover ensures your automations run 24/7, even offline.
            </p>
          </div>

          {/* AI Tiers Visual */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {aiTiers.map((tier, index) => (
              <div
                key={tier.tier}
                className="relative group"
              >
                {/* Connection line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gray-600 to-gray-700 z-0">
                    <ChevronRight className="absolute -right-1 -top-2 w-4 h-4 text-gray-600" />
                  </div>
                )}

                <div className={`card-elevated p-6 text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow ${
                  tier.status === 'primary' ? 'ring-2 ring-taktak-500/50' : ''
                }`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} mb-4 shadow-lg`}>
                    <tier.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">Tier {tier.tier}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-taktak-400" />
                    <span className="text-taktak-400 font-mono">{tier.speed}</span>
                  </div>
                  <p className="text-sm text-gray-400">{tier.description}</p>
                  {tier.status === 'primary' && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-taktak-500/20 text-taktak-300 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="card-elevated overflow-hidden">
            <div className="p-6 border-b border-dark-border">
              <h3 className="text-2xl font-bold text-white">Why Taktak Wins</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-surface">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-taktak-400">Taktak</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Zapier</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Make</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">n8n</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {[
                    { feature: 'AI Failover System', taktak: true, zapier: false, make: false, n8n: false },
                    { feature: 'Offline Operation', taktak: true, zapier: false, make: false, n8n: 'partial' },
                    { feature: 'Local AI (No API)', taktak: true, zapier: false, make: false, n8n: false },
                    { feature: 'Desktop App', taktak: true, zapier: false, make: false, n8n: false },
                    { feature: 'Self-Hostable', taktak: true, zapier: false, make: false, n8n: true },
                    { feature: 'Open Source', taktak: true, zapier: false, make: false, n8n: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-dark-surface/50">
                      <td className="px-6 py-4 text-sm text-gray-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.taktak === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.zapier === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.make === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.n8n === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.n8n === 'partial' ? (
                          <span className="text-yellow-500 text-xs">Partial</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Workflows Section */}
      <section id="workflows" className="relative z-10 py-32 px-6 border-t border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready-to-Use <span className="text-gradient">Workflows</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Start automating in minutes with our pre-built templates. No coding required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {sampleWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="card-interactive group cursor-pointer"
                onClick={() => navigate(`/templates/${workflow.id}/preview`)}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${workflow.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <workflow.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs text-taktak-400 font-medium mb-2">{workflow.category}</div>
                <h3 className="text-lg font-bold text-white mb-2">{workflow.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{workflow.description}</p>

                {/* Workflow nodes preview */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {workflow.nodes.map((node, i) => (
                    <span key={i} className="px-2 py-1 bg-dark-surface text-xs text-gray-400 rounded">
                      {node}
                    </span>
                  ))}
                </div>

                <button className="flex items-center text-taktak-400 text-sm font-medium group-hover:text-taktak-300">
                  <Play className="w-4 h-4 mr-1" />
                  Preview Workflow
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/signup')}
              className="btn btn-primary text-lg px-8 py-4 group"
            >
              <span>Browse All Templates</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-dark-surface to-dark-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Built for <span className="text-gradient">Every Team</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From startups to enterprises, Taktak powers automation across industries
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'IT Operations',
                description: 'Automate incident response, monitoring alerts, and infrastructure management',
                icon: Server,
                examples: ['Auto-scaling triggers', 'Alert routing', 'Backup automation'],
              },
              {
                title: 'Sales & Marketing',
                description: 'Streamline lead capture, nurturing, and customer engagement',
                icon: Star,
                examples: ['Lead scoring', 'Email sequences', 'Social scheduling'],
              },
              {
                title: 'Finance & HR',
                description: 'Automate invoicing, expense tracking, and employee onboarding',
                icon: CreditCard,
                examples: ['Invoice processing', 'Expense reports', 'Onboarding flows'],
              },
            ].map((useCase, i) => (
              <div key={i} className="card-elevated p-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-taktak mb-6 shadow-glow">
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-400 mb-6">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.examples.map((example, j) => (
                    <li key={j} className="flex items-center text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-taktak-400 mr-2 flex-shrink-0" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-down">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to know about Taktak
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Is Taktak really free?',
                answer: 'Yes! Our free tier includes 100 workflow executions per month and up to 3 workflows. Perfect for individuals and small projects. Upgrade anytime for more capacity.'
              },
              {
                question: 'Do I need coding skills to use Taktak?',
                answer: 'Not at all! Taktak features a visual drag-and-drop workflow builder. You can also use our AI assistant to describe your workflow in plain English and have it built automatically.'
              },
              {
                question: 'What integrations are available?',
                answer: 'Taktak currently supports 10+ integrations including Google Sheets, Gmail, Google Drive, Google Calendar, Slack, OpenAI, Stripe, Notion, Airtable, and GitHub. More integrations are added regularly.'
              },
              {
                question: 'Can I use Taktak offline?',
                answer: 'Yes! Taktak is built with an offline-first architecture. You can create and edit workflows offline, and they will automatically sync when you reconnect to the internet.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use bank-level AES encryption for all stored credentials and sensitive data. OAuth2 tokens are encrypted at rest, and we never store your passwords in plain text.'
              },
              {
                question: 'Can I self-host Taktak?',
                answer: 'Yes! Taktak is open source under the MIT License. You can download the desktop app or deploy it on your own infrastructure for complete control over your data.'
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group card-elevated hover:shadow-glow transition-all duration-300"
              >
                <summary className="cursor-pointer p-6 font-semibold text-white text-lg flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-5 h-5 text-taktak-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-400">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <a
              href="https://github.com/MfFischer/taktak/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center"
            >
              Ask on GitHub
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-border bg-dark-surface/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Taktak" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-gradient">Taktak</span>
              </div>
              <p className="text-gray-400 text-sm">
                Shake off the manual work with AI-powered automation.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <a href="https://github.com/MfFischer/taktak_automation_system" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Get Started</button></li>
                <li><a href="https://github.com/MfFischer/taktak_automation_system#readme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/cookies')} className="hover:text-white transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-dark-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 Taktak. Open source under MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

