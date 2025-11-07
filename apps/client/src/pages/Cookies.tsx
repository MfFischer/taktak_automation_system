import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function Cookies() {
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
            <Cookie className="w-8 h-8 text-taktak-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
            <p className="text-gray-400 mt-2">Last updated: November 7, 2024</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How Taktak Uses Cookies</h2>
              <p>
                Taktak uses minimal cookies and local storage to provide essential functionality:
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Essential Cookies</h3>
              <p>These cookies are necessary for the service to function:</p>
              <div className="bg-dark-surface/50 border border-dark-border rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left py-2 text-white">Cookie Name</th>
                      <th className="text-left py-2 text-white">Purpose</th>
                      <th className="text-left py-2 text-white">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-dark-border/50">
                      <td className="py-2 font-mono">token</td>
                      <td className="py-2">Authentication token (JWT)</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-dark-border/50">
                      <td className="py-2 font-mono">user</td>
                      <td className="py-2">User profile information</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono">theme</td>
                      <td className="py-2">UI theme preference</td>
                      <td className="py-2">Persistent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">2.2 Local Storage</h3>
              <p>
                Taktak uses browser local storage to store:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Workflow data:</strong> Your automation workflows (via PouchDB)</li>
                <li><strong>Settings:</strong> Application preferences and configurations</li>
                <li><strong>Cache:</strong> Temporary data for offline functionality</li>
              </ul>
              <p className="mt-4">
                All data stored locally is encrypted and remains on your device unless you enable cloud sync.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Cookies</h2>
              <p>
                Taktak does not use third-party tracking cookies or analytics by default. However, if you enable integrations with third-party services (Google Gemini, OpenRouter, etc.), those services may set their own cookies according to their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Managing Cookies</h2>
              <p>
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
                <li><strong>Logout:</strong> Logging out of Taktak will clear your authentication cookies</li>
                <li><strong>Clear Data:</strong> You can clear all local data through your browser's developer tools</li>
              </ul>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <p className="text-yellow-400 font-semibold">⚠️ Important Note</p>
                <p className="text-sm mt-2">
                  Disabling essential cookies will prevent Taktak from functioning properly. You will not be able to log in or use the service without these cookies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Do Not Track</h2>
              <p>
                Taktak respects Do Not Track (DNT) browser settings. We do not track users across websites or collect analytics data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at:
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

