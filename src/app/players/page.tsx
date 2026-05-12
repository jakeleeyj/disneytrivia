'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPlayer, getCurrentPlayer, getRoster, removePlayer, setCurrentPlayer } from '@/lib/player';

export default function PlayersPage() {
  const router = useRouter();
  const [roster, setRoster] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setRoster(getRoster());
    setCurrent(getCurrentPlayer());
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
    refresh();
    router.push('/');
  }

  function handlePick(n: string) {
    setCurrentPlayer(n);
    router.push('/');
  }

  function handleRemove(n: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Remove ${n}? All progress for this player will stay in storage but stop showing.`)) return;
    removePlayer(n);
    refresh();
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-6">
      <header className="mt-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Who&apos;s drilling?</h1>
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
          Pick yourself or add a new name. Progress is saved on this device.
        </p>
      </header>

      {roster.length > 0 ? (
        <ul className="mb-8 space-y-2" aria-label="Player roster">
          {roster.map((n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => handlePick(n)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  current === n
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]'
                    : 'border-[color:var(--border)] bg-[color:var(--muted)] hover:ring-2 hover:ring-[color:var(--accent)]'
                }`}
              >
                <span className="capitalize font-medium">{n}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleRemove(n, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRemove(n, e as unknown as React.MouseEvent);
                  }}
                  className={`text-xs opacity-70 hover:opacity-100 underline-offset-2 hover:underline ${
                    current === n ? '' : 'text-[color:var(--muted-foreground)]'
                  }`}
                >
                  remove
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={handleAdd} className="space-y-3">
        <label htmlFor="name" className="block text-sm font-medium">
          Add a player
        </label>
        <div className="flex gap-2">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jake"
            autoFocus={roster.length === 0}
            className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[color:var(--accent)] px-4 py-2 font-medium text-[color:var(--accent-foreground)] hover:opacity-90 disabled:opacity-40"
            disabled={!name.trim()}
          >
            Add
          </button>
        </div>
      </form>
    </main>
  );
}
