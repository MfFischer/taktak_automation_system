import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, ArrowLeft, MessageSquare, MapPin, Phone, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For now, just show a success message
      // In production, this would send to a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="border-b border-dark-border backdrop-blur-xl bg-dark-bg/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Taktak" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-gradient">Taktak</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions about Taktak? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-taktak-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-taktak-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:afefischer@gmail.com" className="text-taktak-400 hover:text-taktak-300 transition-colors">
                      afefischer@gmail.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Live Chat</h3>
                    <p className="text-gray-400">Available Monday - Friday</p>
                    <p className="text-sm text-gray-500 mt-1">9:00 AM - 6:00 PM CET</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Location</h3>
                    <p className="text-gray-400">Remote-First Company</p>
                    <p className="text-sm text-gray-500 mt-1">Serving customers worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="card p-8">
              <h2 className="text-xl font-bold text-white mb-4">Frequently Asked</h2>
              <ul className="space-y-3">
                <li>
                  <button type="button" onClick={() => navigate('/#faq')} className="text-gray-400 hover:text-taktak-400 transition-colors text-left">
                    → How does the 4-tier AI failover work?
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/pricing')} className="text-gray-400 hover:text-taktak-400 transition-colors text-left">
                    → What's included in the Desktop license?
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/#faq')} className="text-gray-400 hover:text-taktak-400 transition-colors text-left">
                    → Can I self-host Taktak?
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input type="text" id="name" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white focus:border-taktak-500 focus:ring-1 focus:ring-taktak-500 transition-all"
                    placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input type="email" id="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white focus:border-taktak-500 focus:ring-1 focus:ring-taktak-500 transition-all"
                    placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input type="text" id="subject" required value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white focus:border-taktak-500 focus:ring-1 focus:ring-taktak-500 transition-all"
                  placeholder="How can we help?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea id="message" rows={5} required value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white focus:border-taktak-500 focus:ring-1 focus:ring-taktak-500 transition-all resize-none"
                  placeholder="Tell us more about your question or project..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn btn-primary py-4 flex items-center justify-center space-x-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

