'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPackById } from '@/data/packs';
import type { Pack, Question } from '@/lib/types';

export default function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const maybe = getPackById(id);
  if (!maybe) notFound();
  const basePack = maybe;

  const [pack, setPack] = useState<Pack>(structuredClone(basePack));
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !answer.trim()) return;
    const nextNum = pack.questions.length + 1;
    const newQ: Question = {
      id: `${pack.id}-${String(nextNum).padStart(3, '0')}`,
      prompt: prompt.trim(),
      answer: answer.trim(),
    };
    setPack({ ...pack, questions: [...pack.questions, newQ] });
    setPrompt('');
    setAnswer('');
  }

  function removeQuestion(qid: string) {
    setPack({ ...pack, questions: pack.questions.filter((q) => q.id !== qid) });
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const dirty = pack.questions.length !== basePack.questions.length;

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-4 sm:p-6">
      <Link
        href={`/packs/${basePack.id}`}
        className="text-sm text-[color:var(--muted-foreground)] hover:underline"
      >
        ← {basePack.title}
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Manage questions</h1>
      <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
        Changes are local until you download the JSON and replace{' '}
        <code className="rounded bg-[color:var(--muted)] px-1">src/data/packs/{pack.id}.json</code>{' '}
        in the repo.
      </p>

      <form onSubmit={addQuestion} className="mt-6 space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium">Prompt</label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What animal is Simba?"
            className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="answer" className="block text-sm font-medium">Answer</label>
          <input
            id="answer"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Lion"
            className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          />
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || !answer.trim()}
          className="w-full rounded-lg bg-[color:var(--accent)] py-2 font-medium text-[color:var(--accent-foreground)] hover:opacity-90 disabled:opacity-40"
        >
          Add question
        </button>
      </form>

      {dirty ? (
        <button
          type="button"
          onClick={downloadJSON}
          className="mt-4 w-full rounded-lg bg-[color:var(--foreground)] py-3 font-semibold text-[color:var(--background)] hover:opacity-90"
        >
          Download updated {pack.id}.json
        </button>
      ) : null}

      <h2 className="mt-8 mb-2 text-sm font-semibold">
        {pack.questions.length} questions
      </h2>
      <ul className="space-y-2 text-sm">
        {pack.questions.map((q) => (
          <li
            key={q.id}
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{q.prompt}</p>
              <button
                type="button"
                onClick={() => removeQuestion(q.id)}
                className="text-xs text-[color:var(--danger)] hover:underline"
              >
                remove
              </button>
            </div>
            <p className="mt-1 text-[color:var(--muted-foreground)]">
              <span className="text-xs uppercase tracking-wide">A:</span> {q.answer}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
