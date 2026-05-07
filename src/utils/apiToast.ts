import { toast } from 'sonner';
import { LunerieApiError } from '@/api/lunerie/lunerieClient';

const SILENT_CODES = new Set(['UNAUTHENTICATED']);

/**
 * Centralized error → toast helper for API calls.
 * Returns the error so callers can `.catch(toErrorToast)` and continue.
 */
export function toErrorToast(error: unknown): unknown {
  if (error instanceof LunerieApiError) {
    if (SILENT_CODES.has(error.code)) return error;
    if (error.violations?.length) {
      toast.error(error.violations.map((v) => `${v.field}: ${v.message}`).join('\n'));
    } else {
      toast.error(error.message);
    }
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
