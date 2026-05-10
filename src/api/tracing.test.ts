import { describe, expect, it } from 'vitest';
import { buildTraceparent, getActiveTraceId, newTrace } from '@/api/tracing';

const TRACEPARENT_RE = /^00-[a-f0-9]{32}-[a-f0-9]{16}-(?:00|01)$/;

describe('tracing', () => {
  it('produces W3C-spec traceparent strings', () => {
    const { header } = buildTraceparent();
    expect(header).toMatch(TRACEPARENT_RE);
  });

  it('keeps the same trace id across multiple buildTraceparent calls', () => {
    const a = buildTraceparent();
    const b = buildTraceparent();
    expect(a.traceId).toBe(b.traceId);
    expect(a.traceId).toBe(getActiveTraceId());
  });

  it('hands out a fresh span id per call', () => {
    const a = buildTraceparent();
    const b = buildTraceparent();
    expect(a.spanId).not.toBe(b.spanId);
  });

  it('rolls the trace id when newTrace is invoked', () => {
    const before = getActiveTraceId();
    const next = newTrace();
    expect(next).not.toBe(before);
    expect(getActiveTraceId()).toBe(next);
  });
});
