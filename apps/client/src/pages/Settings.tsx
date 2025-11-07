import { useState, useEffect } from 'react';
import {
  User, Key, Cloud, Bell, Shield, Zap,
  Save, Eye, EyeOff, Copy, Check, Mail,
  MessageSquare, Database, Lock, Sparkles, Brain
} from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc.'
  });

  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openrouter: '',
    twilio: '',
    smtp: ''
  });

  const [cloudSync, setCloudSync] = useState({
    enabled: false,
    couchdbUrl: '',
    username: '',
    password: ''
  });

  const [aiMode, setAIMode] = useState<'cloud' | 'local' | 'auto'>('auto');

  // Load AI mode on mount
  useEffect(() => {
    const loadAIMode = async () => {
      try {
        const response = await api.ai.getMode() as any;
        if (response.data?.mode) {
          setAIMode(response.data.mode);
        }
      } catch (error) {
        console.error('Failed to load AI mode:', error);
      }
    };
    loadAIMode();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleAIModeChange = async (mode: 'cloud' | 'local' | 'auto') => {
    try {
      await api.ai.setMode(mode);
      setAIMode(mode);
    } catch (error) {
      console.error('Failed to update AI mode:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'api-keys', name: 'API Keys', icon: Key },
    { id: 'ai-settings', name: 'AI Settings', icon: Brain },
    { id: 'cloud-sync', name: 'Cloud Sync', icon: Cloud },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-down">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <Zap className="w-8 h-8 text-taktak-500 animate-pulse-glow" />
        </div>
        <p className="text-lg text-gray-400">
          Configure your <span className="text-gradient font-semibold">Taktak</span> platform
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-elevated space-y-2 animate-fade-in-up">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                  activeTab === tab.id
                    ? 'bg-gradient-taktak text-white shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card-elevated space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 pb-6 border-b border-dark-border">
                <div className="p-3 bg-gradient-taktak rounded-xl shadow-glow">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                  <p className="text-sm text-gray-400">Manage your account information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="input"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Company</label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="input"
                    placeholder="Acme Inc."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="card-elevated space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 pb-6 border-b border-dark-border">
                <div className="p-3 bg-gradient-taktak rounded-xl shadow-glow">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">API Keys</h2>
                  <p className="text-sm text-gray-400">Configure integrations and services</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Gemini API Key */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <label className="block text-sm font-semibold text-gray-300">Google Gemini API Key (Tier 1)</label>
                  </div>
                  <p className="text-xs text-gray-500">Fastest AI provider - 0.8s response time</p>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                      className="input pr-24"
                      placeholder="AIza..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(apiKeys.gemini)}
                        className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* OpenRouter API Key */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <label className="block text-sm font-semibold text-gray-300">OpenRouter API Key (Tier 2)</label>
                  </div>
                  <p className="text-xs text-gray-500">Fallback provider with multiple models - Get key from openrouter.ai</p>
                  <input
                    type="password"
                    value={apiKeys.openrouter}
                    onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
                    className="input"
                    placeholder="sk-or-..."
                  />
                </div>

                {/* Twilio API Key */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-accent-400" />
                    <label className="block text-sm font-semibold text-gray-300">Twilio API Key</label>
                  </div>
                  <p className="text-xs text-gray-500">For SMS notifications</p>
                  <input
                    type="password"
                    value={apiKeys.twilio}
                    onChange={(e) => setApiKeys({ ...apiKeys, twilio: e.target.value })}
                    className="input"
                    placeholder="SK..."
                  />
                </div>

                {/* SMTP Settings */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-success-400" />
                    <label className="block text-sm font-semibold text-gray-300">SMTP Password</label>
                  </div>
                  <p className="text-xs text-gray-500">For email notifications</p>
                  <input
                    type="password"
                    value={apiKeys.smtp}
                    onChange={(e) => setApiKeys({ ...apiKeys, smtp: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      <span>Save API Keys</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai-settings' && (
            <div className="card-elevated space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 pb-6 border-b border-dark-border">
                <div className="p-3 bg-gradient-taktak rounded-xl shadow-glow">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Settings</h2>
                  <p className="text-sm text-gray-400">Configure AI mode and preferences</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* AI Mode Selection */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Mode</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Choose how Taktak generates workflows with AI
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {/* Cloud Mode */}
                    <button
                      type="button"
                      onClick={() => handleAIModeChange('cloud')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        aiMode === 'cloud'
                          ? 'border-taktak-500 bg-taktak-500/10'
                          : 'border-dark-border hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${aiMode === 'cloud' ? 'bg-taktak-500' : 'bg-dark-hover'}`}>
                          <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">Cloud AI (Gemini)</h4>
                            {aiMode === 'cloud' && (
                              <span className="px-2 py-1 text-xs font-semibold text-white bg-taktak-500 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Always use Google Gemini for AI generation. Requires API key and internet connection.
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>✓ Best quality</span>
                            <span>✓ Latest models</span>
                            <span>⚠ Requires internet</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Local Mode */}
                    <button
                      type="button"
                      onClick={() => handleAIModeChange('local')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        aiMode === 'local'
                          ? 'border-taktak-500 bg-taktak-500/10'
                          : 'border-dark-border hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${aiMode === 'local' ? 'bg-taktak-500' : 'bg-dark-hover'}`}>
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">Local AI (Phi-3)</h4>
                            {aiMode === 'local' && (
                              <span className="px-2 py-1 text-xs font-semibold text-white bg-taktak-500 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Always use local Phi-3 model. Works offline, no API key needed.
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>✓ Fully offline</span>
                            <span>✓ Privacy-first</span>
                            <span>⚠ Requires model download</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Auto Mode */}
                    <button
                      type="button"
                      onClick={() => handleAIModeChange('auto')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        aiMode === 'auto'
                          ? 'border-taktak-500 bg-taktak-500/10'
                          : 'border-dark-border hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${aiMode === 'auto' ? 'bg-taktak-500' : 'bg-dark-hover'}`}>
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">Auto (Recommended)</h4>
                            {aiMode === 'auto' && (
                              <span className="px-2 py-1 text-xs font-semibold text-white bg-taktak-500 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            4-tier fallback: Gemini → OpenRouter → Phi-3 → Queue. Always works!
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>✓ 99.9% uptime</span>
                            <span>✓ Automatic fallback</span>
                            <span>✓ Always available</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4-Tier Fallback Architecture */}
                <div className="p-4 bg-gradient-to-br from-taktak-500/10 to-purple-500/10 rounded-xl border border-taktak-500/30">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-taktak-500" />
                    Enterprise-Grade 4-Tier Fallback System
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">1</span>
                      <span><strong className="text-white">Gemini</strong> - Fastest, best quality (0.8s)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">2</span>
                      <span><strong className="text-white">OpenRouter</strong> - Multiple models fallback (1.2s)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold">3</span>
                      <span><strong className="text-white">Phi-3 Local</strong> - Offline, privacy-first (1.5s)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white text-xs font-bold">4</span>
                      <span><strong className="text-white">Queue</strong> - Retry when online</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    ✨ Unlike Zapier/Make, Taktak works even when offline or APIs are down!
                  </p>
                </div>

                {/* Model Info */}
                <div className="p-4 bg-dark-hover rounded-xl border border-dark-border">
                  <h4 className="font-semibold text-white mb-2">Local Model Setup</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    To use local AI, download the Phi-3 model (~2.4GB):
                  </p>
                  <code className="block p-3 bg-dark-card rounded-lg text-xs text-gray-300 font-mono overflow-x-auto">
                    See apps/server/models/README.md for download instructions
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Cloud Sync Tab */}
          {activeTab === 'cloud-sync' && (
            <div className="card-elevated space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 pb-6 border-b border-dark-border">
                <div className="p-3 bg-gradient-taktak rounded-xl shadow-glow">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Cloud Sync</h2>
                  <p className="text-sm text-gray-400">Sync workflows to CouchDB</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Enable Cloud Sync */}
                <div className="flex items-center justify-between p-4 bg-dark-hover rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-accent-400" />
                    <div>
                      <p className="font-semibold text-white">Enable Cloud Sync</p>
                      <p className="text-xs text-gray-400">Automatically sync to CouchDB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCloudSync({ ...cloudSync, enabled: !cloudSync.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      cloudSync.enabled ? 'bg-gradient-taktak' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cloudSync.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {cloudSync.enabled && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">CouchDB URL</label>
                      <input
                        type="url"
                        value={cloudSync.couchdbUrl}
                        onChange={(e) => setCloudSync({ ...cloudSync, couchdbUrl: e.target.value })}
                        className="input"
                        placeholder="https://your-couchdb.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Username</label>
                      <input
                        type="text"
                        value={cloudSync.username}
                        onChange={(e) => setCloudSync({ ...cloudSync, username: e.target.value })}
                        className="input"
                        placeholder="admin"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Password</label>
                      <input
                        type="password"
                        value={cloudSync.password}
                        onChange={(e) => setCloudSync({ ...cloudSync, password: e.target.value })}
                        className="input"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save Cloud Sync Settings</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card-elevated space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 pb-6 border-b border-dark-border">
                <div className="p-3 bg-gradient-taktak rounded-xl shadow-glow">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Notifications</h2>
                  <p className="text-sm text-gray-400">Manage notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'workflow-success', label: 'Workflow Success', description: 'Get notified when workflows complete successfully' },
                  { id: 'workflow-failure', label: 'Workflow Failure', description: 'Get notified when workflows fail' },
                  { id: 'system-updates', label: 'System Updates', description: 'Receive updates about new features' },
                  { id: 'security-alerts', label: 'Security Alerts', description: 'Important security notifications' },
                ].map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 bg-dark-hover rounded-xl">
                    <div>
                      <p className="font-semibold text-white">{notification.label}</p>
                      <p className="text-xs text-gray-400">{notification.description}</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-taktak"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card-elevated space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3 pb-6 border-b border-dark-border">
                <div className="p-3 bg-gradient-taktak rounded-xl shadow-glow">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Security</h2>
                  <p className="text-sm text-gray-400">Manage security settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Current Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-taktak-400 transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      className="input pl-12"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-taktak-400 transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      className="input pl-12"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-taktak-400 transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      className="input pl-12"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


