import type { Question } from "./types";

export type DrillLength = number | "unlimited";

type BuildDrillQueueArgs = {
  packQuestions: Question[];
  missQueue: string[];
  length?: DrillLength;
  rng?: () => number;
};

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildDrillQueue({
  packQuestions,
  missQueue,
  length = 20,
  rng = Math.random,
}: BuildDrillQueueArgs): Question[] {
  if (packQuestions.length === 0) return [];

  const missSet = new Set(missQueue);
  const missedInPack = shuffle(
    packQuestions.filter((q) => missSet.has(q.id)),
    rng,
  );
  const freshInPack = shuffle(
    packQuestions.filter((q) => !missSet.has(q.id)),
    rng,
  );

  // Unlimited: miss-queue first, then the rest. Caller loops when index runs out.
  if (length === "unlimited") {
    return [...missedInPack, ...freshInPack];
  }

  const target = Math.min(length, packQuestions.length);
  const missTarget = Math.min(Math.floor(target * 0.4), missedInPack.length);

  const selected: Question[] = [
    ...missedInPack.slice(0, missTarget),
    ...freshInPack.slice(0, target - missTarget),
  ];

  // If miss-queue didn't fill its slice (small miss queue), top up from leftover missed
  if (selected.length < target) {
    const leftoverMissed = missedInPack.slice(missTarget);
    selected.push(...leftoverMissed.slice(0, target - selected.length));
  }

  return shuffle(selected, rng);
}
