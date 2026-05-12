'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { packs } from '@/data/packs';
import { getCurrentPlayer } from '@/lib/player';
import { getAccuracyByCategory, getTotalDrilled } from '@/lib/attempts';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS, type Category } from '@/lib/categories';

export default function StatsPage() {
  const [player, setPlayer] = useState<string | null>(null);
  const [byCat, setByCat] = useState<Record<Category, number>>({} as Record<Category, number>);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const p = getCurrentPlayer();
    setPlayer(p);
    if (!p) return;
    setByCat(getAccuracyByCategory(p, packs));
    setTotal(getTotalDrilled(p));
  }, []);

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
      <Link href="/" className="text-sm text-[color:var(--muted-foreground)] hover:underline">
        ← Home
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Stats</h1>
      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
        {player ? <>For <span className="capitalize font-medium">{player}</span></> : '—'}
      </p>

      <section className="mt-6 rounded-xl bg-[color:var(--muted)] p-4">
        <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
          Total cards drilled
        </p>
        <p className="mt-1 text-3xl font-bold font-mono">{total}</p>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Accuracy by category</h2>
        <dl className="space-y-2">
          {CATEGORIES.map((cat) => {
            const acc = byCat[cat];
            const pct = acc === undefined ? null : Math.round(acc * 100);
            const colors = CATEGORY_COLORS[cat];
            return (
              <div
                key={cat}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)] p-3"
              >
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm font-medium">
                    <span className={`inline-block size-2 rounded-full ${colors.bg.replace('bg-', 'bg-')}`} aria-hidden />
                    {CATEGORY_LABELS[cat]}
                  </dt>
                  <dd className="font-mono text-sm">
                    {pct === null ? <span className="text-[color:var(--muted-foreground)]">—</span> : `${pct}%`}
                  </dd>
                </div>
                {pct !== null ? (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--background)]">
                    <div
                      className="h-full bg-[color:var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </dl>
      </section>
    </main>
  );
}
