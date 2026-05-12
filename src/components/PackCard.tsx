'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Pack } from '@/lib/types';
import { getCurrentPlayer } from '@/lib/player';
import { getPackAccuracy, getMissQueue } from '@/lib/attempts';
import { CategoryChip } from './CategoryChip';

export function PackCard({ pack }: { pack: Pack }) {
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [missCount, setMissCount] = useState(0);

  useEffect(() => {
    const player = getCurrentPlayer();
    if (!player) return;
    setAccuracy(getPackAccuracy(player, pack));
    const miss = getMissQueue(player);
    const ids = new Set(pack.questions.map((q) => q.id));
    setMissCount(miss.filter((id) => ids.has(id)).length);
  }, [pack]);

  return (
    <Link
      href={`/packs/${pack.id}`}
      className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4 hover:ring-2 hover:ring-[color:var(--accent)] transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-tight">{pack.title}</h3>
        <CategoryChip category={pack.category} />
      </div>
      <p className="mt-1 text-sm text-[color:var(--muted-foreground)] line-clamp-2">
        {pack.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-[color:var(--muted-foreground)]">
          {pack.questions.length} questions
        </span>
        <div className="flex items-center gap-2">
          {missCount > 0 ? (
            <span className="rounded-full bg-[color:var(--danger)] px-2 py-0.5 font-medium text-white">
              {missCount} to redo
            </span>
          ) : null}
          {accuracy !== null && accuracy > 0 ? (
            <span className="font-mono text-[color:var(--muted-foreground)]">
              {Math.round(accuracy * 100)}%
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
