import type { Category, Difficulty } from "./categories";

export type Question = {
  id: string;
  prompt: string;
  answer: string;
  accepted?: string[];
  /**
   * One-sentence context that helps the player remember why the answer
   * is correct. Optional — only worth adding when there's something to learn.
   */
  explanation?: string;
  sourceUrl?: string;
};

export type Pack = {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  source: "manual" | "opentdb" | "parade" | "curated";
  questions: Question[];
};

export type AttemptResult = "got_it" | "missed";

export type Attempt = {
  questionId: string;
  packId: string;
  result: AttemptResult;
  ts: number;
};
