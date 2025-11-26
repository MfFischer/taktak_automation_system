import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Zap, Shield, WifiOff, Sparkles, Play,
  Star, Workflow, Bot, Database
} from 'lucide-react';

export default function Desktop() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux'>('windows');

  useEffect(() => {
    // Detect user's platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1) {
      setPlatform('mac');
    } else if (userAgent.indexOf('linux') !== -1) {
      setPlatform('linux');
    } else {
      setPlatform('windows');
    }
  }, []);

  const features = [
    {
      icon: WifiOff,
      title: 'Offline-First',
      description: 'Work without internet. All your workflows run locally on your machine.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Native desktop performance. No lag, no waiting, just pure speed.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays on your device. Bank-level encryption for everything.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Bot,
      title: 'AI-Powered',
      description: 'Local AI with Phi-3. Build workflows with natural language.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Workflow,
      title: 'Visual Builder',
      description: 'Drag-and-drop interface. No coding required.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Database,
      title: 'Unlimited Workflows',
      description: 'Create as many workflows as you need. No limits, no restrictions.',
      gradient: 'from-teal-500 to-cyan-500',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Clinic Owner',
      avatar: '👩‍⚕️',
      rating: 5,
      text: 'Taktak Desktop transformed our clinic operations. Patient reminders are now automated, and we never miss a follow-up. The offline capability is a lifesaver!',
    },
    {
      name: 'Miguel Rodriguez',
      role: 'Store Manager',
      avatar: '👨‍💼',
      rating: 5,
      text: 'Best investment for my store. Inventory alerts, order confirmations, everything runs smoothly. The one-time payment is worth every penny.',
    },
    {
      name: 'Amina Hassan',
      role: 'Cooperative Leader',
      avatar: '👩‍🌾',
      rating: 5,
      text: 'Our cooperative members love the automated notifications. Meeting reminders, contribution tracking - all handled automatically. Highly recommended!',
    },
  ];

  // Download links - users need to purchase first
  const handleDownload = () => {
    // Redirect to pricing page to purchase
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 backdrop-blur-xl bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Taktak" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gradient">Taktak Desktop</h1>
                <p className="text-xs text-gray-400">Offline-First Automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/pricing')} className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </button>
              <button onClick={() => navigate('/login')} className="btn btn-ghost">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">One-Time Payment • Lifetime Access</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="text-white">Automate Everything</span>
              <br />
              <span className="text-gradient">Without Internet</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              The only automation platform that works 100% offline. Perfect for small businesses in emerging markets.
              One-time payment of <span className="text-blue-400 font-bold">$29</span>. No subscriptions, no hidden fees.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDownload}
                className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Get Taktak Desktop - $29
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="btn btn-ghost text-lg px-8 py-4"
              >
                View All Plans
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              One-time payment • Lifetime license • Free updates
            </p>

            <p className="text-sm text-gray-400 mt-4">
              Free trial • No credit card required • {platform === 'windows' ? 'Windows 10+' : platform === 'mac' ? 'macOS 10.15+' : 'Ubuntu 20.04+'}
            </p>
          </div>

          {/* Desktop App Screenshot / Workflow Demo */}
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800">
              {/* Fake App Window */}
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-sm text-gray-400">Taktak Desktop — Workflow Editor</div>
              </div>

              {/* Workflow Canvas Preview */}
              <div className="aspect-video bg-gradient-to-br from-gray-850 to-gray-900 p-8 relative">
                {/* Sample workflow nodes */}
                <div className="flex items-center justify-center gap-8 h-full">
                  {/* Trigger Node */}
                  <div className="bg-blue-600/20 border-2 border-blue-500 rounded-xl p-4 text-center animate-pulse">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium">Form Trigger</span>
                  </div>

                  {/* Arrow */}
                  <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                  {/* AI Node */}
                  <div className="bg-purple-600/20 border-2 border-purple-500 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium">AI Process</span>
                  </div>

                  {/* Arrow */}
                  <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-green-500"></div>

                  {/* Action Node */}
                  <div className="bg-green-600/20 border-2 border-green-500 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium">Save to DB</span>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute bottom-4 right-4 bg-green-500/20 border border-green-500 rounded-full px-3 py-1 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Works Offline</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 mt-4">Build powerful workflows with our intuitive drag-and-drop editor</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features designed for small businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by Small Businesses
            </h2>
            <p className="text-xl text-gray-400">
              See what our users have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Automate Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses using Taktak Desktop. One-time payment, lifetime access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDownload}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Get Taktak Desktop - $29
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                View All Plans
              </button>
            </div>
            <p className="text-sm text-blue-100 mt-6">
              30-day money-back guarantee • Free updates forever
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Taktak" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-white">Taktak</span>
              </div>
              <p className="text-gray-400 text-sm">
                Offline-first automation for small businesses in emerging markets.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/pricing')} className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/app/templates')} className="text-gray-400 hover:text-white transition-colors">Templates</button></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><button type="button" onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors">Contact Us</button></li>
                <li><button type="button" onClick={() => navigate('/help')} className="text-gray-400 hover:text-white transition-colors">Help Center</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/privacy')} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/cookies')} className="text-gray-400 hover:text-white transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Taktak. All rights reserved. Made with ❤️ for small businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

