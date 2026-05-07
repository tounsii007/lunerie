import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/logging/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.captureException(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, padding: 24, borderRadius: 28, background: 'var(--app-elevated)', border: '1px solid var(--app-border)' }}>
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 12 }}>Global error boundary</p>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>The app needs a clean refresh.</h1>
            <p style={{ opacity: 0.8, lineHeight: 1.5 }}>A structured log entry was stored for diagnostics and future Sentry wiring.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
