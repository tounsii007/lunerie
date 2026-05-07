import { ApiErrorSchema, type ApiError } from '@/domain/models';

export class AppError extends Error {
  readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'AppError';
    this.apiError = ApiErrorSchema.parse(apiError);
  }
}

export function toAppError(error: unknown, source: string, details?: Record<string, unknown>): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  return new AppError({
    code: 'UNEXPECTED_ERROR',
    message,
    source,
    retryable: false,
    details,
  });
}
