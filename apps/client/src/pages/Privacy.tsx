import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <nav className="border-b border-dark-border backdrop-blur-xl bg-dark-surface/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-taktak-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-taktak-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-400 mt-2">Last updated: November 7, 2024</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                Taktak ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our automation platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Workflow configurations and automation data</li>
                <li>API keys and integration credentials (encrypted)</li>
                <li>Support communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usage data and analytics</li>
                <li>Device information and IP address</li>
                <li>Log data and error reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process your workflows and automations</li>
                <li>Send service-related notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
              <p>
                Taktak uses an offline-first architecture with PouchDB for local storage. Your data is stored locally on your device by default. If you enable cloud sync, data is synchronized to CouchDB servers with encryption in transit and at rest.
              </p>
              <p className="mt-4">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>AES-256 encryption for sensitive data</li>
                <li>JWT-based authentication</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security audits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
              <p>
                Taktak integrates with third-party services for AI capabilities and notifications:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Google Gemini:</strong> AI workflow generation (optional)</li>
                <li><strong>OpenRouter:</strong> AI fallback provider (optional)</li>
                <li><strong>Local Phi-3:</strong> Offline AI processing (no data leaves your device)</li>
                <li><strong>Twilio:</strong> SMS notifications (if configured)</li>
                <li><strong>SMTP Providers:</strong> Email notifications (if configured)</li>
              </ul>
              <p className="mt-4">
                Each third-party service has its own privacy policy. We recommend reviewing their policies before enabling these integrations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide services. You can delete your account and all associated data at any time through the Settings page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
              <p>
                Taktak is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <ul className="list-none space-y-2 mt-2">
                <li>Email: privacy@taktak.app</li>
                <li>GitHub: <a href="https://github.com/MfFischer/taktak_automation_system" className="text-taktak-400 hover:text-taktak-300">github.com/MfFischer/taktak_automation_system</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

