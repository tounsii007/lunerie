import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { PersistentStore } from '@/storage/persistentStore';

describe('PersistentStore', () => {
  it('returns fallback when invalid data is stored', () => {
    const store = new PersistentStore('test-key', z.object({ enabled: z.boolean() }), 1, { enabled: true });
    window.localStorage.setItem('test-key', JSON.stringify({ version: 1, value: { enabled: 'nope' } }));
    expect(store.read()).toEqual({ enabled: true });
  });
});
