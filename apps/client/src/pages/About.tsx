/**
 * About Us Page
 * Company information and story
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Shield, Globe, Users, Linkedin, Github } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Taktak" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-gradient">Taktak</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">Taktak</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            We're building the future of workflow automation — reliable, intelligent, and always available.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-dark-surface/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
          <p className="text-lg text-gray-300 leading-relaxed text-center">
            At Taktak, we believe automation should be accessible to everyone — not just developers. 
            Our mission is to empower businesses of all sizes to automate their repetitive tasks, 
            save time, and focus on what truly matters: growing their business and serving their customers.
          </p>
        </div>
      </section>

      {/* Why Taktak Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Taktak?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: '99.9% Uptime', description: 'Enterprise-grade reliability with our 4-tier AI failover system' },
              { icon: Shield, title: 'Secure by Design', description: 'Your data is encrypted and protected with industry-leading security' },
              { icon: Globe, title: 'Works Offline', description: 'Continue working even without internet — your workflows never stop' },
              { icon: Users, title: 'Built for Teams', description: 'Collaborate seamlessly with role-based access and shared workflows' },
            ].map((item, idx) => (
              <div key={idx} className="card-interactive p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-taktak-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6 bg-dark-surface/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6">
            <p>
              Taktak was born from a simple frustration: existing automation tools were either too complex 
              for non-developers or too unreliable for critical business processes. We saw teams losing 
              hours to manual work, and when they tried to automate, they faced steep learning curves 
              and unpredictable failures.
            </p>
            <p>
              We set out to build something different — an automation platform that's as easy to use as 
              it is powerful. With our revolutionary 4-tier AI failover system, Taktak delivers 99.9% 
              uptime that competitors simply can't match. When one AI provider is slow or unavailable, 
              we seamlessly switch to the next, ensuring your workflows never miss a beat.
            </p>
            <p>
              Today, Taktak helps businesses around the world automate their most important processes — 
              from lead capture and customer support to invoice processing and data synchronization. 
              And we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Connect With Us</h2>
          <div className="flex justify-center gap-6">
            <a
              href="https://www.linkedin.com/in/maria-fe-fischer/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-[#0077B5] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
            <a
              href="https://github.com/MfFischer/taktak"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
          </div>
          <p className="mt-8 text-gray-400">
            Have questions? <button type="button" onClick={() => navigate('/contact')} className="text-taktak-400 hover:text-taktak-300 underline">Contact us</button>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-taktak-600/20 to-purple-600/20 border-t border-dark-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Automate?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of businesses using Taktak to save time and reduce errors.
          </p>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="btn btn-primary text-lg px-8 py-4"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}

