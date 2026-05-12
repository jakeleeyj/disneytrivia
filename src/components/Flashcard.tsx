'use client';

import { useState } from 'react';
import type { Question } from '@/lib/types';

type Props = {
  question: Question;
  onResult: (result: 'got_it' | 'missed') => void;
};

// Parent should pass `key={question.id}` so internal state resets per card.
export function Flashcard({ question, onResult }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 grid place-items-center">
        <div className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-6">
          <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
            Question
          </p>
          <p className="mt-3 text-lg font-medium leading-snug text-balance">{question.prompt}</p>

          {revealed ? (
            <div className="mt-6 border-t border-[color:var(--border)] pt-4">
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Answer
              </p>
              <p className="mt-2 text-lg font-semibold">{question.answer}</p>
              {question.accepted && question.accepted.length > 0 ? (
                <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                  Also accepted: {question.accepted.join(', ')}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-xl bg-[color:var(--accent)] py-4 text-base font-semibold text-[color:var(--accent-foreground)] hover:opacity-90"
          >
            Reveal answer
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onResult('missed')}
              className="rounded-xl bg-[color:var(--danger)] py-4 text-base font-semibold text-white hover:opacity-90"
            >
              Missed
            </button>
            <button
              type="button"
              onClick={() => onResult('got_it')}
              className="rounded-xl bg-[color:var(--success)] py-4 text-base font-semibold text-white hover:opacity-90"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
