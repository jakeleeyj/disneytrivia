import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackById, MIX_PACK_ID, packs } from "@/data/packs";
import { CategoryChip } from "@/components/CategoryChip";
import { PlayerSwitcher } from "@/components/PlayerSwitcher";

export function generateStaticParams() {
  return [...packs.map((p) => ({ id: p.id })), { id: MIX_PACK_ID }];
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = getPackById(id);
  if (!pack) notFound();
  const isMix = pack.id === MIX_PACK_ID;

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
      <header className="mt-2 mb-6 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="text-sm text-[color:var(--muted-foreground)] hover:underline"
        >
          ← Home
        </Link>
        <PlayerSwitcher />
      </header>

      {!isMix ? (
        <div className="mb-2">
          <CategoryChip category={pack.category} />
          <span className="ml-2 text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
            {pack.difficulty}
          </span>
        </div>
      ) : (
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-[color:var(--foreground)] px-2 py-0.5 text-xs font-medium text-[color:var(--background)]">
            All categories
          </span>
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight">{pack.title}</h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        {pack.description}
      </p>
      <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
        {pack.questions.length} questions
      </p>

      <div className="mt-8 space-y-3">
        <Link
          href={`/packs/${pack.id}/drill?length=20`}
          className="block rounded-xl bg-[color:var(--accent)] px-4 py-4 text-center font-semibold text-[color:var(--accent-foreground)] hover:opacity-90"
        >
          Quick drill (20 cards)
        </Link>
        <Link
          href={`/packs/${pack.id}/drill?length=unlimited`}
          className="block rounded-xl border-2 border-[color:var(--accent)] px-4 py-4 text-center font-semibold text-[color:var(--accent)] hover:bg-[color:var(--muted)]"
        >
          Marathon (unlimited)
        </Link>
        {!isMix ? (
          <Link
            href={`/packs/${pack.id}/manage`}
            className="block rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] px-4 py-3 text-center text-sm font-medium hover:ring-2 hover:ring-[color:var(--border)]"
          >
            Manage questions →
          </Link>
        ) : null}
      </div>
    </main>
  );
}
