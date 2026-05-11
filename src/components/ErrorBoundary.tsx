import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/logging/logger';
import { messages } from '@/i18n/messages';
import { DEFAULT_LOCALE, type LocaleCode } from '@/constants/app';

/** Resolve i18n key without going through the provider (class component). */
function tStatic(key: string): string {
  const locale = (typeof document !== 'undefined' ? (document.documentElement.lang as LocaleCode) : DEFAULT_LOCALE);
  const localized = messages[locale] as unknown as Record<string, string | undefined>;
  const fallback = messages[DEFAULT_LOCALE] as unknown as Record<string, string | undefined>;
  return localized?.[key] ?? fallback?.[key] ?? key;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.captureException(error, { componentStack: errorInfo.componentStack });
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: null });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background: 'var(--app-bg-image)',
            color: 'var(--app-text)',
          }}
        >
          <div
            style={{
              maxWidth: 460,
              width: '100%',
              padding: 28,
              borderRadius: 32,
              background: 'var(--app-elevated)',
              border: '1px solid var(--app-border)',
              boxShadow: '0 24px 60px rgba(2, 8, 23, 0.42)',
              display: 'grid',
              gap: 14,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                margin: '0 auto',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                fontWeight: 800,
              }}
              aria-hidden
            >
              !
            </div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent-light)',
                fontWeight: 700,
              }}
            >
              {tStatic('errors.unexpected')}
            </p>
            <h1
              style={{
                fontSize: 28,
                fontFamily: '"Fraunces", serif',
                fontWeight: 600,
                letterSpacing: '-0.014em',
                lineHeight: 1.1,
              }}
            >
              {tStatic('errors.cleanRefresh')}
            </h1>
            <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.6, fontSize: 14 }}>
              {tStatic('errors.cleanRefreshBody')}
            </p>
            {this.state.message ? (
              <pre
                style={{
                  textAlign: 'start',
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 14,
                  background: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                  fontSize: 12,
                  color: 'var(--app-text-muted)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {this.state.message}
              </pre>
            ) : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                  color: 'var(--app-text)',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {tStatic('errors.tryAgain')}
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: '0 12px 30px var(--accent-glow)',
                }}
              >
                {tStatic('errors.reload')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
