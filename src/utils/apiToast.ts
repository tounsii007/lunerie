import { toast } from 'sonner';
import { LunerieApiError } from '@/api/lunerie/lunerieClient';

/**
 * Codes that the auth system handles by re-prompting / refreshing tokens —
 * surfacing a toast here would be noise on top of the redirect/login UI.
 */
const SILENT_CODES = new Set(['UNAUTHENTICATED', 'INVALID_REFRESH_TOKEN']);

function formatViolations(error: LunerieApiError): string {
  if (!error.violations?.length) return error.message;
  const lines = error.violations.map((v) => `• ${v.field}: ${v.message}`);
  return [error.message, ...lines].join('\n');
}

function describe(error: LunerieApiError): { title: string; description?: string } {
  if (error.status === 429) {
    const wait = error.retryAfterSeconds ?? 60;
    return {
      title: 'Slow down a moment',
      description: `Too many requests — please retry in ~${wait}s.`,
    };
  }
  if (error.status >= 500) {
    return {
      title: 'Server error',
      description: error.requestId
        ? `${error.message} · ref ${error.requestId.slice(0, 8)}`
        : error.message,
    };
  }
  if (error.code === 'NETWORK_ERROR' || error.status === 0) {
    return {
      title: 'No connection',
      description: 'Check your network and try again.',
    };
  }
  if (error.violations?.length) {
    return { title: error.message, description: formatViolations(error) };
  }
  return { title: error.message };
}

/**
 * Centralized error → toast helper for API calls.
 * Returns the error so callers can `.catch(toErrorToast)` and continue.
 */
export function toErrorToast(error: unknown): unknown {
  if (error instanceof LunerieApiError) {
    if (SILENT_CODES.has(error.code)) return error;
    const { title, description } = describe(error);
    toast.error(title, description ? { description } : undefined);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('Something went wrong');
  }
  return error;
}

/**
 * Wraps an async fn so that thrown LunerieApiErrors are toasted.
 * Re-throws so that promise consumers (React Query, etc.) still observe failure.
 */
export function withErrorToast<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((error) => {
    toErrorToast(error);
    throw error;
  });
}
