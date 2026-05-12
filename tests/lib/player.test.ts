import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRoster,
  getCurrentPlayer,
  setCurrentPlayer,
  addPlayer,
  removePlayer,
} from '@/lib/player';

describe('player', () => {
  beforeEach(() => localStorage.clear());

  it('starts with empty roster and no current player', () => {
    expect(getRoster()).toEqual([]);
    expect(getCurrentPlayer()).toBeNull();
  });

  it('adds a player and sets them current on first add', () => {
    addPlayer('jake');
    expect(getRoster()).toEqual(['jake']);
    expect(getCurrentPlayer()).toBe('jake');
  });

  it('does not duplicate names (case-insensitive trim)', () => {
    addPlayer('jake');
    addPlayer('  Jake ');
    expect(getRoster()).toEqual(['jake']);
  });

  it('switches current player', () => {
    addPlayer('jake');
    addPlayer('cher');
    setCurrentPlayer('cher');
    expect(getCurrentPlayer()).toBe('cher');
  });

  it('rejects setting current to a name not in roster', () => {
    addPlayer('jake');
    setCurrentPlayer('ghost');
    expect(getCurrentPlayer()).toBe('jake');
  });

  it('removes a player and clears current if it was them', () => {
    addPlayer('jake');
    addPlayer('cher');
    removePlayer('jake');
    expect(getRoster()).toEqual(['cher']);
    expect(getCurrentPlayer()).toBe('cher');
  });

  it('clears current when last player removed', () => {
    addPlayer('jake');
    removePlayer('jake');
    expect(getCurrentPlayer()).toBeNull();
  });

  it('trims whitespace and rejects empty names', () => {
    addPlayer('   ');
    expect(getRoster()).toEqual([]);
    addPlayer('  cher  ');
    expect(getRoster()).toEqual(['cher']);
  });
});
