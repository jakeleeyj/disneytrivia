import Link from 'next/link';
import { packs } from '@/data/packs';
import { PackCard } from '@/components/PackCard';
import { PlayerSwitcher } from '@/components/PlayerSwitcher';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
      <header className="mt-2 mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Disney Trivia Trainer</h1>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            Drill packs. Crush bar night.
          </p>
        </div>
        <PlayerSwitcher />
      </header>

      <nav aria-label="Sections" className="mb-6 flex gap-2 text-sm">
        <Link
          href="/stats"
          className="rounded-full bg-[color:var(--muted)] px-3 py-1 hover:ring-2 hover:ring-[color:var(--border)]"
        >
          My stats →
        </Link>
      </nav>

      <section className="grid gap-3" aria-label="Question packs">
        {packs.map((pack) => (
          <PackCard key={pack.id} pack={pack} />
        ))}
      </section>
    </main>
  );
}
