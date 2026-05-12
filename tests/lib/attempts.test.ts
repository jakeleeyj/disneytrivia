import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordAttempt,
  getAttempts,
  getMissQueue,
  getAccuracyByCategory,
  getPackAccuracy,
  getTotalDrilled,
} from '@/lib/attempts';
import type { Pack } from '@/lib/types';

const pack: Pack = {
  id: 'pixar-test',
  title: 'Pixar Test',
  description: '',
  category: 'pixar',
  difficulty: 'easy',
  source: 'manual',
  questions: [
    { id: 'q1', prompt: 'p1', answer: 'a1' },
    { id: 'q2', prompt: 'p2', answer: 'a2' },
    { id: 'q3', prompt: 'p3', answer: 'a3' },
  ],
};

const packB: Pack = {
  ...pack,
  id: 'parks-test',
  category: 'parks',
  questions: [
    { id: 'q4', prompt: 'p4', answer: 'a4' },
    { id: 'q5', prompt: 'p5', answer: 'a5' },
  ],
};

describe('attempts', () => {
  beforeEach(() => localStorage.clear());

  it('records an attempt and appends to the log', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'got_it' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q2', result: 'missed' });
    expect(getAttempts('jake').length).toBe(2);
  });

  it('adds missed question to miss-queue', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    expect(getMissQueue('jake')).toContain('q1');
  });

  it('removes question from miss-queue when later got_it', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    expect(getMissQueue('jake')).toContain('q1');
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'got_it' });
    expect(getMissQueue('jake')).not.toContain('q1');
  });

  it('does not duplicate questions in miss-queue', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    expect(getMissQueue('jake').filter((id) => id === 'q1').length).toBe(1);
  });

  it('keeps per-player progress independent', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    recordAttempt({ player: 'cher', packId: pack.id, questionId: 'q2', result: 'got_it' });
    expect(getMissQueue('jake')).toEqual(['q1']);
    expect(getMissQueue('cher')).toEqual([]);
    expect(getAttempts('cher').length).toBe(1);
  });

  it('computes pack accuracy from latest attempt per question', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'got_it' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q2', result: 'got_it' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q3', result: 'missed' });
    // latest: q1=got, q2=got, q3=missed → 2/3
    expect(getPackAccuracy('jake', pack)).toBeCloseTo(2 / 3, 3);
  });

  it('returns 0 accuracy when no attempts in pack', () => {
    expect(getPackAccuracy('jake', pack)).toBe(0);
  });

  it('aggregates accuracy by category across packs', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'got_it' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q2', result: 'missed' });
    recordAttempt({ player: 'jake', packId: packB.id, questionId: 'q4', result: 'got_it' });
    const byCat = getAccuracyByCategory('jake', [pack, packB]);
    expect(byCat.pixar).toBeCloseTo(0.5, 3);
    expect(byCat.parks).toBeCloseTo(1, 3);
  });

  it('counts total cards drilled by latest attempt', () => {
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'got_it' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q1', result: 'missed' });
    recordAttempt({ player: 'jake', packId: pack.id, questionId: 'q2', result: 'got_it' });
    expect(getTotalDrilled('jake')).toBe(2);
  });
});
