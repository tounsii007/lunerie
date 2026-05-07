import { describe, expect, it } from 'vitest';
import { externalContentService } from '@/api/services/externalContentService';

describe('external content service', () => {
  it('returns curated explore places', async () => {
    const result = await externalContentService.getExplorePlaces();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.fromCache).toBe(true);
  });

  it('filters by search text', async () => {
    const result = await externalContentService.searchPlaces({ text: 'Tunisia' });
    expect(result.items[0]?.countryCode).toBe('TN');
  });
});
