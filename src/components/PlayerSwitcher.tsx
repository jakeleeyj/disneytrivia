'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentPlayer } from '@/lib/player';

export function PlayerSwitcher() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getCurrentPlayer());
  }, []);

  if (!name) return null;

  return (
    <Link
      href="/players"
      aria-label="Switch player"
      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--muted)] px-3 py-1.5 text-sm font-medium hover:ring-2 hover:ring-[color:var(--border)]"
    >
      <span className="inline-block size-2 rounded-full bg-[color:var(--success)]" />
      <span className="capitalize">{name}</span>
      <span className="text-[color:var(--muted-foreground)]">switch</span>
    </Link>
  );
}
