/**
 * Global Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you could send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="card-elevated text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-error-500/20 rounded-full">
                  <AlertTriangle className="w-16 h-16 text-error-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-3">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-gray-400 mb-6">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-dark-card rounded-lg text-left">
                  <p className="text-sm font-mono text-error-300 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>

                <button
                  onClick={this.handleReload}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500 mt-6">
                If this problem persists, please{' '}
                <a
                  href="https://github.com/MfFischer/taktak/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-taktak-400 hover:text-taktak-300 underline"
                >
                  report an issue
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

