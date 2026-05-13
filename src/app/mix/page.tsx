"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { packs } from "@/data/packs";
import { getCurrentPlayer } from "@/lib/player";
import { getMixSelection, setMixSelection } from "@/lib/mixSelection";
import { CategoryChip } from "@/components/CategoryChip";

const allIds = packs.map((p) => p.id);

export default function MixChooserPage() {
  const [player, setPlayer] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = getCurrentPlayer();
    setPlayer(p);
    if (!p) {
      setReady(true);
      return;
    }
    setSelected(new Set(getMixSelection(p, allIds)));
    setReady(true);
  }, []);

  function toggle(id: string) {
    if (!player) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setMixSelection(player, Array.from(next));
  }

  function selectAll() {
    if (!player) return;
    setSelected(new Set(allIds));
    setMixSelection(player, allIds);
  }

  function selectNone() {
    if (!player) return;
    setSelected(new Set());
    setMixSelection(player, []);
  }

  function selectDisneyPixar() {
    if (!player) return;
    const focus = packs
      .filter((p) => p.category === "animated" || p.category === "pixar")
      .map((p) => p.id);
    setSelected(new Set(focus));
    setMixSelection(player, focus);
  }

  if (!ready) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <p className="text-sm text-[color:var(--muted-foreground)]">Loading…</p>
      </main>
    );
  }

  const count = selected.size;
  const totalQuestions = packs
    .filter((p) => selected.has(p.id))
    .reduce((sum, p) => sum + p.questions.length, 0);

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
      <Link
        href="/"
        className="text-sm text-[color:var(--muted-foreground)] hover:underline"
      >
        ← Home
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Build your mix</h1>
      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
        Pick which packs to draw from. Saved per player.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={selectDisneyPixar}
          className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-1 font-medium hover:ring-2 hover:ring-[color:var(--accent)]"
        >
          Disney + Pixar only
        </button>
        <button
          type="button"
          onClick={selectAll}
          className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-1 font-medium hover:ring-2 hover:ring-[color:var(--border)]"
        >
          All
        </button>
        <button
          type="button"
          onClick={selectNone}
          className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-1 font-medium hover:ring-2 hover:ring-[color:var(--border)]"
        >
          None
        </button>
      </div>

      <fieldset className="mt-4 space-y-2" aria-label="Pack selection">
        {packs.map((pack) => {
          const checked = selected.has(pack.id);
          return (
            <label
              key={pack.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                checked
                  ? "border-[color:var(--accent)] bg-[color:var(--muted)]"
                  : "border-[color:var(--border)] bg-[color:var(--background)]"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(pack.id)}
                className="mt-1 size-4 accent-[color:var(--accent)]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pack.title}</span>
                  <CategoryChip category={pack.category} />
                </div>
                <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)]">
                  {pack.questions.length} questions · {pack.difficulty}
                </p>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur p-4 sm:-mx-6 sm:p-6">
        <p className="mb-3 text-xs text-[color:var(--muted-foreground)]">
          {count} pack{count === 1 ? "" : "s"} · {totalQuestions} questions in
          pool
        </p>
        <div className="grid gap-2">
          <Link
            href="/packs/mix/drill?length=20"
            aria-disabled={count === 0}
            className={`block rounded-xl px-4 py-4 text-center font-semibold ${
              count === 0
                ? "pointer-events-none bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                : "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90"
            }`}
          >
            Quick drill (20 cards)
          </Link>
          <Link
            href="/packs/mix/drill?length=unlimited"
            aria-disabled={count === 0}
            className={`block rounded-xl border-2 px-4 py-4 text-center font-semibold ${
              count === 0
                ? "pointer-events-none border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                : "border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--muted)]"
            }`}
          >
            Marathon (unlimited)
          </Link>
        </div>
      </div>
    </main>
  );
}
