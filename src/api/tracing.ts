/**
 * Minimal W3C TraceContext implementation for the browser.
 *
 * The full OpenTelemetry web SDK (~150 KB gzipped with the BatchSpanProcessor +
 * OTLP exporter) is overkill for a single-page app whose primary value is
 * having {@code traceparent} on outbound API calls so backend traces include
 * the originating frontend request. This module:
 *
 *   - generates a fresh trace per page-load (or per `newTrace()` call)
 *   - hands out a fresh span-id per outbound request
 *   - exposes {@link buildTraceparent} that returns the
 *     {@code traceparent} header value the backend's Micrometer Tracing
 *     bridge will pick up (W3C TraceContext spec).
 *
 * Spec: https://www.w3.org/TR/trace-context/#traceparent-header
 *   traceparent = "version-traceId-spanId-flags"
 *   version  = "00"
 *   traceId  = 32 hex chars (16 bytes)
 *   spanId   = 16 hex chars (8 bytes)
 *   flags    = "01" sampled / "00" not sampled
 */

const TRACE_VERSION = '00';
const FLAGS_SAMPLED = '01';

let activeTraceId: string = generateTraceId();

function randomHex(bytes: number): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback: not crypto-strong, but adequate for trace IDs which are not security-sensitive.
  let out = '';
  for (let i = 0; i < bytes; i += 1) {
    out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  return out;
}

function generateTraceId(): string {
  return randomHex(16);
}

function generateSpanId(): string {
  return randomHex(8);
}

/** Start a new trace — typically called once per logical user flow. */
export function newTrace(): string {
  activeTraceId = generateTraceId();
  return activeTraceId;
}

/** Returns the active trace id (lowercase hex, 32 chars). */
export function getActiveTraceId(): string {
  return activeTraceId;
}

/**
 * Build a {@code traceparent} header value for an outbound request. Each call
 * returns a fresh span id so the backend can attach its own work as a child.
 *
 * Returns an object with the header pair plus the generated span id, in case
 * the caller wants to emit a UI-side log entry that correlates with the span.
 */
export function buildTraceparent(): { header: string; traceId: string; spanId: string } {
  const spanId = generateSpanId();
  return {
    header: `${TRACE_VERSION}-${activeTraceId}-${spanId}-${FLAGS_SAMPLED}`,
    traceId: activeTraceId,
    spanId,
  };
}
