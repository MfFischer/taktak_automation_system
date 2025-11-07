import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
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
            <FileText className="w-8 h-8 text-taktak-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400 mt-2">Last updated: November 7, 2024</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Taktak, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. License</h2>
              <p>
                Taktak is open-source software licensed under the MIT License. You are free to use, modify, and distribute the software in accordance with the MIT License terms.
              </p>
              <div className="bg-dark-surface/50 border border-dark-border rounded-lg p-4 mt-4">
                <p className="text-sm font-mono">
                  MIT License - Copyright (c) 2024 Taktak
                </p>
                <p className="text-sm mt-2">
                  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate and complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
              <p>You agree not to use Taktak to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malware or malicious code</li>
                <li>Spam or harass others</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Interfere with the proper functioning of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
              <p>
                Taktak integrates with third-party services (Google Gemini, OpenRouter, Twilio, etc.). Your use of these services is subject to their respective terms of service. We are not responsible for the availability, accuracy, or reliability of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. API Keys and Credentials</h2>
              <p>
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Obtaining and managing your own API keys for third-party services</li>
                <li>Complying with the terms of service of API providers</li>
                <li>Any costs incurred from API usage</li>
                <li>Keeping your API keys secure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data and Privacy</h2>
              <p>
                Your use of Taktak is also governed by our Privacy Policy. Taktak uses an offline-first architecture, and your data is stored locally by default. If you enable cloud sync, your data will be synchronized to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p>
                TAKTAK IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TAKTAK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications to Service</h2>
              <p>
                We reserve the right to modify or discontinue the service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Contact Us</h2>
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <ul className="list-none space-y-2 mt-2">
                <li>Email: legal@taktak.app</li>
                <li>GitHub: <a href="https://github.com/MfFischer/taktak_automation_system" className="text-taktak-400 hover:text-taktak-300">github.com/MfFischer/taktak_automation_system</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

