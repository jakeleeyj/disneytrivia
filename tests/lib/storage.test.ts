import { describe, it, expect, beforeEach } from 'vitest';
import { readJSON, writeJSON, removeKey } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns fallback when key is missing', () => {
    expect(readJSON('missing', { foo: 1 })).toEqual({ foo: 1 });
  });

  it('round-trips JSON', () => {
    writeJSON('k', { a: 1, b: [2, 3] });
    expect(readJSON('k', null)).toEqual({ a: 1, b: [2, 3] });
  });

  it('returns fallback for malformed JSON', () => {
    localStorage.setItem('bad', '{not-json');
    expect(readJSON('bad', 'fallback')).toBe('fallback');
  });

  it('removes a key', () => {
    writeJSON('k', 1);
    removeKey('k');
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('is SSR-safe when localStorage is unavailable', () => {
    const orig = globalThis.localStorage;
    // @ts-expect-error force missing storage
    delete (globalThis as { localStorage?: Storage }).localStorage;
    expect(readJSON('k', 'safe')).toBe('safe');
    expect(() => writeJSON('k', 1)).not.toThrow();
    globalThis.localStorage = orig;
  });
});
