import { readJSON, writeJSON } from './storage';
import type { Attempt, AttemptResult, Pack } from './types';
import type { Category } from './categories';

const attemptsKey = (player: string) => `dt:attempts:${player}`;
const missKey = (player: string) => `dt:miss:${player}`;

export function getAttempts(player: string): Attempt[] {
  return readJSON<Attempt[]>(attemptsKey(player), []);
}

export function getMissQueue(player: string): string[] {
  return readJSON<string[]>(missKey(player), []);
}

type RecordArgs = {
  player: string;
  packId: string;
  questionId: string;
  result: AttemptResult;
};

export function recordAttempt({ player, packId, questionId, result }: RecordArgs): void {
  const attempts = getAttempts(player);
  attempts.push({ packId, questionId, result, ts: Date.now() });
  writeJSON(attemptsKey(player), attempts);

  const miss = new Set(getMissQueue(player));
  if (result === 'missed') {
    miss.add(questionId);
  } else {
    miss.delete(questionId);
  }
  writeJSON(missKey(player), Array.from(miss));
}

function latestPerQuestion(attempts: Attempt[]): Map<string, Attempt> {
  const latest = new Map<string, Attempt>();
  for (const a of attempts) {
    const prev = latest.get(a.questionId);
    if (!prev || a.ts >= prev.ts) latest.set(a.questionId, a);
  }
  return latest;
}

export function getPackAccuracy(player: string, pack: Pack): number {
  const latest = latestPerQuestion(getAttempts(player).filter((a) => a.packId === pack.id));
  if (latest.size === 0) return 0;
  let correct = 0;
  for (const a of latest.values()) if (a.result === 'got_it') correct++;
  return correct / latest.size;
}

export function getAccuracyByCategory(player: string, packs: Pack[]): Record<Category, number> {
  const attempts = getAttempts(player);
  const packById = new Map(packs.map((p) => [p.id, p]));
  const latest = latestPerQuestion(attempts);

  const totals: Partial<Record<Category, { correct: number; total: number }>> = {};
  for (const a of latest.values()) {
    const pack = packById.get(a.packId);
    if (!pack) continue;
    const cat = pack.category;
    const bucket = (totals[cat] ??= { correct: 0, total: 0 });
    bucket.total += 1;
    if (a.result === 'got_it') bucket.correct += 1;
  }

  const out = {} as Record<Category, number>;
  for (const cat of Object.keys(totals) as Category[]) {
    const bucket = totals[cat]!;
    out[cat] = bucket.total === 0 ? 0 : bucket.correct / bucket.total;
  }
  return out;
}

export function getTotalDrilled(player: string): number {
  return latestPerQuestion(getAttempts(player)).size;
}
