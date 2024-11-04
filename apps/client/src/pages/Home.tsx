import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, CheckCircle, Sparkles, 
  Workflow, Bot, Cloud, Lock, Mail, LogIn,
  Loader2, Github, Twitter, Linkedin
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
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300">Pricing</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors duration-300">Docs</a>
              <button 
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
                <div className="mt-6 flex items-center text-taktak-400 font-medium group cursor-pointer">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-border bg-dark-surface/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Taktak" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-gradient">Taktak</span>
              </div>
              <p className="text-gray-400 text-sm">
                Shake off the manual work with AI-powered automation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-dark-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 Taktak. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
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
        </div>
      </footer>
    </div>
  );
}

