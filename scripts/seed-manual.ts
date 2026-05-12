/**
 * Copies seed/manual/*.json into src/data/packs/ after validating shape.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'seed', 'manual');
const DEST = join(process.cwd(), 'src', 'data', 'packs');

const VALID_CATEGORIES = new Set([
  'animated',
  'pixar',
  'parks',
  'live-action',
  'star-wars',
  'marvel',
  'disney-tv',
]);
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

type Pack = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  source: string;
  questions: { id: string; prompt: string; answer: string; accepted?: string[]; sourceUrl?: string }[];
};

function validate(pack: Pack, file: string): void {
  const fail = (msg: string) => {
    throw new Error(`[${file}] ${msg}`);
  };
  if (!pack.id) fail('missing id');
  if (!pack.title) fail('missing title');
  if (!VALID_CATEGORIES.has(pack.category)) fail(`invalid category: ${pack.category}`);
  if (!VALID_DIFFICULTIES.has(pack.difficulty)) fail(`invalid difficulty: ${pack.difficulty}`);
  if (!Array.isArray(pack.questions) || pack.questions.length === 0) fail('no questions');
  const seenIds = new Set<string>();
  for (const q of pack.questions) {
    if (!q.id) fail(`question missing id`);
    if (seenIds.has(q.id)) fail(`duplicate question id: ${q.id}`);
    seenIds.add(q.id);
    if (!q.prompt) fail(`question ${q.id} missing prompt`);
    if (!q.answer) fail(`question ${q.id} missing answer`);
  }
}

function main() {
  if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });
  const files = readdirSync(SRC).filter((f) => f.endsWith('.json'));
  let total = 0;
  for (const file of files) {
    const raw = readFileSync(join(SRC, file), 'utf-8');
    const pack = JSON.parse(raw) as Pack;
    validate(pack, file);
    writeFileSync(join(DEST, file), JSON.stringify(pack, null, 2) + '\n');
    total += pack.questions.length;
    console.log(`  ${pack.id}: ${pack.questions.length} questions`);
  }
  console.log(`\nseed-manual: copied ${files.length} packs, ${total} questions total`);
}

main();
