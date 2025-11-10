import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, CheckCircle, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DownloadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [copied, setCopied] = useState(false);

  // Get license key from URL params (if redirected from checkout)
  const licenseKey = searchParams.get('license') || 'Check your email for license key';
  const fromCheckout = searchParams.get('checkout') === 'success';

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setPlatform('mac');
    } else if (userAgent.includes('linux')) {
      setPlatform('linux');
    } else {
      setPlatform('windows');
    }
  }, []);

  const downloadLinks = {
    windows: {
      url: 'https://github.com/MfFischer/taktak_automation_system/releases/latest/download/Taktak-Setup.exe',
      name: 'Taktak-Setup.exe',
      size: '~80 MB',
    },
    mac: {
      url: 'https://github.com/MfFischer/taktak_automation_system/releases/latest/download/Taktak.dmg',
      name: 'Taktak.dmg',
      size: '~85 MB',
    },
    linux: {
      url: 'https://github.com/MfFischer/taktak_automation_system/releases/latest/download/Taktak.AppImage',
      name: 'Taktak.AppImage',
      size: '~90 MB',
    },
  };

  const handleCopyLicense = () => {
    if (licenseKey && licenseKey !== 'Check your email for license key') {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      toast.success('License key copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
    toast.success('Download started!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 backdrop-blur-xl bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Taktak" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gradient">Taktak</h1>
                <p className="text-xs text-gray-400">AI Automation Platform</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Success Message */}
        {fromCheckout && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                🎉 Payment Successful!
              </h3>
              <p className="text-gray-300">
                Thank you for purchasing Taktak Desktop! Your license key has been sent to your email.
                Follow the steps below to get started.
              </p>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Download Taktak Desktop
          </h1>
          <p className="text-xl text-gray-300">
            Get started in 3 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1: Download */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold text-white">Download the Installer</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Choose your platform and download the installer:
            </p>

            {/* Platform Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPlatform('windows')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  platform === 'windows'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Windows
              </button>
              <button
                onClick={() => setPlatform('mac')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  platform === 'mac'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                macOS
              </button>
              <button
                onClick={() => setPlatform('linux')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  platform === 'linux'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Linux
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={() => handleDownload(downloadLinks[platform].url)}
              className="w-full btn btn-primary text-lg py-4 flex items-center justify-center gap-3"
            >
              <Download className="w-6 h-6" />
              Download {downloadLinks[platform].name}
              <span className="text-sm opacity-75">({downloadLinks[platform].size})</span>
            </button>

            <p className="text-sm text-gray-400 mt-4 text-center">
              Or download from{' '}
              <a
                href="https://github.com/MfFischer/taktak_automation_system/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
              >
                GitHub Releases
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Step 2: Install */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold text-white">Install the Application</h2>
            </div>

            <div className="space-y-4 text-gray-300">
              {platform === 'windows' && (
                <>
                  <p>1. Run the downloaded <code className="bg-gray-700 px-2 py-1 rounded">Taktak-Setup.exe</code></p>
                  <p>2. Follow the installation wizard</p>
                  <p>3. Launch Taktak from the Start Menu or Desktop shortcut</p>
                </>
              )}
              {platform === 'mac' && (
                <>
                  <p>1. Open the downloaded <code className="bg-gray-700 px-2 py-1 rounded">Taktak.dmg</code> file</p>
                  <p>2. Drag Taktak to your Applications folder</p>
                  <p>3. Launch Taktak from Applications</p>
                  <p className="text-yellow-400 text-sm">
                    ⚠️ If you see "Taktak cannot be opened", right-click the app and select "Open"
                  </p>
                </>
              )}
              {platform === 'linux' && (
                <>
                  <p>1. Make the file executable: <code className="bg-gray-700 px-2 py-1 rounded">chmod +x Taktak.AppImage</code></p>
                  <p>2. Run the AppImage: <code className="bg-gray-700 px-2 py-1 rounded">./Taktak.AppImage</code></p>
                  <p>3. Or double-click the file in your file manager</p>
                </>
              )}
            </div>
          </div>

          {/* Step 3: Activate */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold text-white">Activate with License Key</h2>
            </div>

            <p className="text-gray-300 mb-4">
              When the app launches, it will ask for your license key. Copy the key below:
            </p>

            {/* License Key Display */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-yellow-400">YOUR LICENSE KEY</span>
                <button
                  onClick={handleCopyLicense}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-semibold"
                  disabled={licenseKey === 'Check your email for license key'}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <code className="text-2xl font-mono font-bold text-white tracking-wider">
                  {licenseKey}
                </code>
              </div>
              {licenseKey === 'Check your email for license key' && (
                <p className="text-sm text-yellow-300 mt-3 text-center">
                  📧 Your license key has been sent to your email address
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">🚀 What's Next?</h3>
          <ul className="space-y-3 text-gray-300 mb-6">
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Explore 18 ready-made workflow templates</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Build your first automation with the visual workflow editor</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Configure AI settings (Gemini, OpenRouter, or local Phi-3)</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Connect your services (Twilio, SMTP, databases)</span>
            </li>
          </ul>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/app/templates')}
              className="btn btn-primary"
            >
              Browse Templates
            </button>
            <a
              href="https://github.com/MfFischer/taktak_automation_system"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              View Documentation
            </a>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-2">Need help?</p>
          <a
            href="https://github.com/MfFischer/taktak_automation_system/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2"
          >
            Get Support
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

