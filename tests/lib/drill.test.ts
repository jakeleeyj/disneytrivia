import { describe, it, expect } from "vitest";
import { buildDrillQueue } from "@/lib/drill";
import type { Question } from "@/lib/types";

function makeQuestions(n: number, prefix = "q"): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${i}`,
    prompt: `p${i}`,
    answer: `a${i}`,
  }));
}

// deterministic RNG for assertions
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

describe("buildDrillQueue", () => {
  it("returns at most `length` questions", () => {
    const q = buildDrillQueue({
      packQuestions: makeQuestions(50),
      missQueue: [],
      length: 20,
      rng: seededRandom(1),
    });
    expect(q.length).toBe(20);
  });

  it("returns all when pack has fewer than length", () => {
    const q = buildDrillQueue({
      packQuestions: makeQuestions(5),
      missQueue: [],
      length: 20,
      rng: seededRandom(1),
    });
    expect(q.length).toBe(5);
  });

  it("biases toward miss-queue (~40% of length)", () => {
    const pack = makeQuestions(100);
    const missIds = pack.slice(0, 30).map((q) => q.id);
    const queue = buildDrillQueue({
      packQuestions: pack,
      missQueue: missIds,
      length: 20,
      rng: seededRandom(7),
    });
    const missInQueue = queue.filter((q) => missIds.includes(q.id)).length;
    // length=20, target 40% = 8. Allow 6-12 to absorb shuffle.
    expect(missInQueue).toBeGreaterThanOrEqual(6);
    expect(missInQueue).toBeLessThanOrEqual(12);
  });

  it("still works when miss-queue is empty", () => {
    const q = buildDrillQueue({
      packQuestions: makeQuestions(30),
      missQueue: [],
      length: 10,
      rng: seededRandom(2),
    });
    expect(q.length).toBe(10);
  });

  it("does not duplicate questions in the output", () => {
    const pack = makeQuestions(40);
    const missIds = pack.slice(0, 10).map((q) => q.id);
    const queue = buildDrillQueue({
      packQuestions: pack,
      missQueue: missIds,
      length: 20,
      rng: seededRandom(3),
    });
    const ids = queue.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ignores miss-queue ids not in the pack", () => {
    const pack = makeQuestions(10);
    const queue = buildDrillQueue({
      packQuestions: pack,
      missQueue: ["nope-1", "nope-2"],
      length: 5,
      rng: seededRandom(4),
    });
    expect(queue.length).toBe(5);
    expect(queue.every((q) => pack.some((p) => p.id === q.id))).toBe(true);
  });

  it("produces a different order under different seeds", () => {
    const pack = makeQuestions(20);
    const a = buildDrillQueue({
      packQuestions: pack,
      missQueue: [],
      length: 20,
      rng: seededRandom(1),
    });
    const b = buildDrillQueue({
      packQuestions: pack,
      missQueue: [],
      length: 20,
      rng: seededRandom(99),
    });
    expect(a.map((q) => q.id)).not.toEqual(b.map((q) => q.id));
  });

  it("unlimited returns all questions with miss-queue at the front", () => {
    const pack = makeQuestions(30);
    const missIds = ["q-5", "q-10", "q-20"];
    const queue = buildDrillQueue({
      packQuestions: pack,
      missQueue: missIds,
      length: "unlimited",
      rng: seededRandom(1),
    });
    expect(queue.length).toBe(30);
    // first 3 entries should all be from miss queue (in some order)
    const firstThree = queue.slice(0, 3).map((q) => q.id);
    expect(new Set(firstThree)).toEqual(new Set(missIds));
  });

  it("unlimited still de-duplicates and respects pack contents", () => {
    const pack = makeQuestions(10);
    const queue = buildDrillQueue({
      packQuestions: pack,
      missQueue: [],
      length: "unlimited",
      rng: seededRandom(2),
    });
    expect(queue.length).toBe(10);
    expect(new Set(queue.map((q) => q.id)).size).toBe(10);
  });
});
