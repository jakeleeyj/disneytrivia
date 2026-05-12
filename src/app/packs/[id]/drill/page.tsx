"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { buildOriginPackMap, getPackById, MIX_PACK_ID } from "@/data/packs";
import { buildDrillQueue, type DrillLength } from "@/lib/drill";
import { getCurrentPlayer } from "@/lib/player";
import { getMissQueue, recordAttempt } from "@/lib/attempts";
import { Flashcard } from "@/components/Flashcard";
import type { Question } from "@/lib/types";

function parseLength(raw: string | null): DrillLength {
  if (raw === "unlimited") return "unlimited";
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 20;
}

export default function DrillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const maybePack = getPackById(id);
  if (!maybePack) notFound();
  const pack = maybePack;
  const isMix = pack.id === MIX_PACK_ID;

  const router = useRouter();
  const searchParams = useSearchParams();
  const length = parseLength(searchParams.get("length"));
  const unlimited = length === "unlimited";

  const [player, setPlayer] = useState<string | null>(null);
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Array<"got_it" | "missed">>([]);
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  // Origin pack lookup only matters in mix mode
  const originMap = useMemo(
    () => (isMix ? buildOriginPackMap() : null),
    [isMix],
  );

  useEffect(() => {
    const p = getCurrentPlayer();
    if (!p) {
      router.replace("/players");
      return;
    }
    setPlayer(p);
    const miss = getMissQueue(p);
    setQueue(
      buildDrillQueue({
        packQuestions: pack.questions,
        missQueue: miss,
        length,
      }),
    );
    // Depend on pack.id (stable) not pack itself — the mix pack is rebuilt
    // every render, which would otherwise re-shuffle the queue on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack.id, router, length]);

  const total = queue?.length ?? 0;
  const current = queue && index < total ? queue[index] : null;
  const naturallyDone = !unlimited && queue !== null && index >= total;
  const done = naturallyDone || finished;

  const summary = useMemo(() => {
    if (!done) return null;
    const got = results.filter((r) => r === "got_it").length;
    const missed = results.length - got;
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    return { got, missed, seconds, total: results.length };
  }, [done, results, startedAt]);

  function resolvePackId(questionId: string): string {
    if (originMap) return originMap.get(questionId) ?? pack.id;
    return pack.id;
  }

  function handleResult(result: "got_it" | "missed") {
    if (!player || !current) return;
    recordAttempt({
      player,
      packId: resolvePackId(current.id),
      questionId: current.id,
      result,
    });
    setResults((r) => [...r, result]);

    if (unlimited && queue) {
      // Loop: regenerate a fresh shuffle when we hit the end.
      if (index + 1 >= queue.length) {
        const miss = getMissQueue(player);
        setQueue(
          buildDrillQueue({
            packQuestions: pack.questions,
            missQueue: miss,
            length: "unlimited",
          }),
        );
        setIndex(0);
        return;
      }
    }
    setIndex((i) => i + 1);
  }

  if (!queue) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Shuffling…
        </p>
      </main>
    );
  }

  if (total === 0) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <p>This pack has no questions yet.</p>
        <Link
          href={`/packs/${pack.id}`}
          className="mt-4 inline-block underline"
        >
          Back to pack
        </Link>
      </main>
    );
  }

  if (done && summary) {
    const percent =
      summary.total > 0 ? Math.round((summary.got / summary.total) * 100) : 0;
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <h1 className="text-2xl font-bold">Done.</h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          {pack.title} — {summary.total} cards in {summary.seconds}s
          {unlimited ? " (marathon)" : ""}
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[color:var(--muted)] p-4">
            <dt className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
              Score
            </dt>
            <dd className="mt-1 text-2xl font-bold">{percent}%</dd>
          </div>
          <div className="rounded-xl bg-[color:var(--muted)] p-4">
            <dt className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
              Got
            </dt>
            <dd className="mt-1 text-2xl font-bold text-[color:var(--success)]">
              {summary.got}
            </dd>
          </div>
          <div className="rounded-xl bg-[color:var(--muted)] p-4">
            <dt className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
              Missed
            </dt>
            <dd className="mt-1 text-2xl font-bold text-[color:var(--danger)]">
              {summary.missed}
            </dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-2">
          {summary.missed > 0 ? (
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setResults([]);
                setFinished(false);
                const miss = getMissQueue(player!);
                setQueue(
                  buildDrillQueue({
                    packQuestions: pack.questions,
                    missQueue: miss,
                    length: Math.min(summary.missed * 2, 20),
                  }),
                );
              }}
              className="rounded-xl bg-[color:var(--accent)] py-4 font-semibold text-[color:var(--accent-foreground)] hover:opacity-90"
            >
              Drill misses now
            </button>
          ) : null}
          {!isMix ? (
            <Link
              href={`/packs/${pack.id}`}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] py-3 text-center font-medium hover:ring-2 hover:ring-[color:var(--border)]"
            >
              Back to pack
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] py-3 text-center font-medium hover:ring-2 hover:ring-[color:var(--border)]"
          >
            Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
        <Link
          href={isMix ? "/" : `/packs/${pack.id}`}
          className="hover:underline"
        >
          ← {pack.title}
        </Link>
        <span>
          {unlimited ? `${results.length} drilled` : `${index + 1} / ${total}`}
        </span>
      </div>
      <div
        className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[color:var(--muted)]"
        role="progressbar"
        aria-valuenow={unlimited ? results.length : index}
        aria-valuemin={0}
        aria-valuemax={unlimited ? Math.max(results.length, 1) : total}
      >
        <div
          className="h-full bg-[color:var(--accent)] transition-[width] duration-200"
          style={{
            width: unlimited
              ? "100%"
              : `${((index + (current ? 0 : 1)) / total) * 100}%`,
          }}
        />
      </div>
      {current ? (
        <Flashcard
          key={current.id}
          question={current}
          onResult={handleResult}
        />
      ) : null}

      {unlimited && results.length > 0 ? (
        <button
          type="button"
          onClick={() => setFinished(true)}
          className="mt-3 self-center text-xs text-[color:var(--muted-foreground)] underline-offset-2 hover:underline"
        >
          Finish marathon
        </button>
      ) : null}
    </main>
  );
}
