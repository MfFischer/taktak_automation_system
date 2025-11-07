import { useEffect, useState } from 'react';
import { Download, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error' | 'dev-mode';
  version?: string;
  releaseNotes?: string;
  releaseDate?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  error?: string;
  message?: string;
}

export default function UpdateNotification() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    if (typeof window !== 'undefined' && (window as any).electron) {
      const electron = (window as any).electron;

      // Listen for update status changes
      const unsubscribe = electron.onUpdateStatus((status: UpdateStatus) => {
        console.log('Update status:', status);
        setUpdateStatus(status);

        // Show notification for certain statuses
        if (['available', 'downloaded', 'error'].includes(status.status)) {
          setIsVisible(true);
        }

        // Hide notification when download starts
        if (status.status === 'downloading') {
          setIsDownloading(true);
        }

        // Auto-hide after 10 seconds for non-critical statuses
        if (status.status === 'not-available') {
          setTimeout(() => setIsVisible(false), 10000);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []);

  const handleDownload = async () => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      const electron = (window as any).electron;
      setIsDownloading(true);
      await electron.downloadUpdate();
    }
  };

  const handleInstall = async () => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      const electron = (window as any).electron;
      await electron.installUpdate();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !updateStatus) {
    return null;
  }

  // Don't show anything in dev mode
  if (updateStatus.status === 'dev-mode') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-up">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {updateStatus.status === 'available' && (
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
            )}
            {updateStatus.status === 'downloading' && (
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            )}
            {updateStatus.status === 'downloaded' && (
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            )}
            {updateStatus.status === 'error' && (
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white">
                {updateStatus.status === 'available' && 'Update Available'}
                {updateStatus.status === 'downloading' && 'Downloading Update'}
                {updateStatus.status === 'downloaded' && 'Update Ready'}
                {updateStatus.status === 'error' && 'Update Error'}
                {updateStatus.status === 'not-available' && 'No Updates'}
              </h3>
              {updateStatus.version && (
                <p className="text-sm text-gray-400">Version {updateStatus.version}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {updateStatus.status === 'available' && (
            <>
              <p className="text-gray-300 mb-4">
                A new version of Taktak is available. Would you like to download it now?
              </p>
              {updateStatus.releaseNotes && (
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {updateStatus.releaseNotes}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn btn-primary flex-1"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Update
                    </>
                  )}
                </button>
                <button onClick={handleDismiss} className="btn btn-ghost">
                  Later
                </button>
              </div>
            </>
          )}

          {updateStatus.status === 'downloading' && (
            <>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Downloading...</span>
                  <span>{Math.round(updateStatus.percent || 0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${updateStatus.percent || 0}%` }}
                  ></div>
                </div>
              </div>
              {updateStatus.transferred && updateStatus.total && (
                <p className="text-xs text-gray-400 text-center">
                  {(updateStatus.transferred / 1024 / 1024).toFixed(1)} MB /{' '}
                  {(updateStatus.total / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </>
          )}

          {updateStatus.status === 'downloaded' && (
            <>
              <p className="text-gray-300 mb-4">
                The update has been downloaded. Restart Taktak to install the new version.
              </p>
              <div className="flex gap-2">
                <button onClick={handleInstall} className="btn btn-primary flex-1">
                  <CheckCircle className="w-4 h-4" />
                  Restart & Install
                </button>
                <button onClick={handleDismiss} className="btn btn-ghost">
                  Later
                </button>
              </div>
            </>
          )}

          {updateStatus.status === 'error' && (
            <>
              <p className="text-red-400 mb-4">
                {updateStatus.error || 'An error occurred while checking for updates.'}
              </p>
              <button onClick={handleDismiss} className="btn btn-ghost w-full">
                Dismiss
              </button>
            </>
          )}

          {updateStatus.status === 'not-available' && (
            <>
              <p className="text-gray-300 mb-4">
                You're running the latest version of Taktak!
              </p>
              <button onClick={handleDismiss} className="btn btn-ghost w-full">
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

