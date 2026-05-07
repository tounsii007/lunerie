import { FEATURE_FLAGS } from '@/constants/app';
import { STORAGE_KEYS } from '@/constants/storage';
import { safeIsoDate } from '@/utils/datetime';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 80;

function readLogs(): LogEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.logs);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLogs(entries: LogEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(entries.slice(-MAX_LOG_ENTRIES)));
  } catch {
    return;
  }
}

export function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: safeIsoDate(new Date()),
    context,
  };

  writeLogs([...readLogs(), entry]);

  if (!FEATURE_FLAGS.enableDebugLogs) {
    return;
  }

  const payload = context ? [message, context] : [message];
  if (level === 'error') {
    console.error(...payload);
    return;
  }

  if (level === 'warn') {
    console.warn(...payload);
    return;
  }

  console.info(...payload);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
  captureException: (error: unknown, context?: Record<string, unknown>) => {
    const message = error instanceof Error ? error.message : 'Unknown exception';
    log('error', message, context);
  },
};
