import { describe, expect, it } from 'vitest';
import { OverpassResponseSchema, RestCountrySchema } from '@/api/schemas';

describe('api schemas', () => {
  it('validates overpass responses', () => {
    const parsed = OverpassResponseSchema.parse({
      elements: [{ id: 1, type: 'node', lat: 1, lon: 2, tags: { tourism: 'viewpoint' } }],
    });

    expect(parsed.elements).toHaveLength(1);
  });

  it('rejects malformed rest country payloads', () => {
    expect(() => RestCountrySchema.parse({})).toThrow();
  });
});
