import { useCallback, useState } from 'react';
import { toErrorToast } from '@/utils/apiToast';

interface AsyncActionOptions<T> {
  onSuccess?: (value: T) => void;
  onError?: (error: unknown) => void;
  /** Show a toast on error. Default true. */
  toastOnError?: boolean;
}

interface AsyncActionState<T> {
  /** True between invocation and resolution. */
  pending: boolean;
  /** Error from the most recent call, or null. */
  error: unknown;
  /** Most recent successful result. */
  data: T | null;
}

/**
 * Wraps an async function with `pending` / `error` / `data` state, automatic toast on
 * failure, and ergonomic invocation. Replaces ad-hoc `setBusy(true)` / try-catch boilerplate.
 *
 * @example
 *   const save = useAsyncAction((req) => lunerie.profile.updateName(req.name));
 *   <button onClick={() => save.run({ name: 'Alice' })} disabled={save.pending}>Save</button>
 */
export function useAsyncAction<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  options: AsyncActionOptions<Result> = {},
) {
  const [state, setState] = useState<AsyncActionState<Result>>({
    pending: false,
    error: null,
    data: null,
  });

  const run = useCallback(async (...args: Args): Promise<Result | undefined> => {
    setState((prev) => ({ ...prev, pending: true, error: null }));
    try {
      const result = await fn(...args);
      setState({ pending: false, error: null, data: result });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      setState((prev) => ({ ...prev, pending: false, error }));
      if (options.toastOnError !== false) toErrorToast(error);
      options.onError?.(error);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn]);

  const reset = useCallback(() => {
    setState({ pending: false, error: null, data: null });
  }, []);

  return { ...state, run, reset };
}
