'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentPlayer } from '@/lib/player';

export function PlayerGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const player = getCurrentPlayer();
    if (player === null && pathname !== '/players') {
      router.replace('/players');
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex-1 grid place-items-center text-sm text-[color:var(--muted-foreground)]">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
