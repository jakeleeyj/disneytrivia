import Link from "next/link";
import { packs } from "@/data/packs";
import { PackCard } from "@/components/PackCard";
import { PlayerSwitcher } from "@/components/PlayerSwitcher";

export default function Home() {
  const totalQuestions = packs.reduce((sum, p) => sum + p.questions.length, 0);

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
      <header className="mt-2 mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Disney Trivia Trainer
          </h1>
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

      <section className="mb-6" aria-label="Mix">
        <Link
          href="/mix"
          className="block rounded-2xl bg-[color:var(--foreground)] p-5 text-[color:var(--background)] hover:opacity-90"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Build a mix</h2>
              <p className="mt-1 text-sm opacity-80">
                Pick which packs you want — then drill.
              </p>
            </div>
            <span className="rounded-full bg-[color:var(--background)] px-2 py-0.5 text-xs font-medium text-[color:var(--foreground)]">
              {totalQuestions}
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-2 py-0.5">
              Choose packs
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5">
              Quick or Marathon
            </span>
          </div>
        </Link>
      </section>

      <h2 className="mb-2 text-sm font-semibold text-[color:var(--muted-foreground)]">
        Packs
      </h2>
      <section className="grid gap-3" aria-label="Question packs">
        {packs.map((pack) => (
          <PackCard key={pack.id} pack={pack} />
        ))}
      </section>
    </main>
  );
}
