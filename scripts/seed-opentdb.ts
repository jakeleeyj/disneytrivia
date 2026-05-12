/**
 * Pulls Disney-themed questions from Open Trivia DB and writes JSON packs
 * to src/data/packs/. Run with `npm run seed:opentdb`.
 *
 * No API key required. Run on demand; output is committed.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEST = join(process.cwd(), 'src', 'data', 'packs');

// Open Trivia DB category IDs we'll mine for Disney content
const CATEGORIES = [
  { id: 11, name: 'film', label: 'Entertainment: Film' },
  { id: 32, name: 'cartoons', label: 'Entertainment: Cartoon & Animations' },
];

// Keyword filter — question or answer must contain one of these
const DISNEY_KEYWORDS = [
  'disney',
  'pixar',
  'mickey',
  'minnie',
  'donald duck',
  'goofy',
  'pluto',
  'walt',
  'frozen',
  'elsa',
  'anna',
  'olaf',
  'toy story',
  'woody',
  'buzz lightyear',
  'finding nemo',
  'nemo',
  'dory',
  'simba',
  'mufasa',
  'scar',
  'lion king',
  'aladdin',
  'jasmine',
  'genie',
  'jafar',
  'ariel',
  'ursula',
  'little mermaid',
  'belle',
  'beast',
  'beauty and the beast',
  'cinderella',
  'snow white',
  'sleeping beauty',
  'maleficent',
  'tangled',
  'rapunzel',
  'mulan',
  'pocahontas',
  'moana',
  'hercules',
  'tarzan',
  'bambi',
  'dumbo',
  'pinocchio',
  'peter pan',
  'tinker bell',
  'jungle book',
  'mowgli',
  'baloo',
  'cars',
  'lightning mcqueen',
  'wall-e',
  'walle',
  'wall e',
  'ratatouille',
  'incredibles',
  'monsters inc',
  'monsters, inc',
  'up (pixar',
  'inside out',
  'star wars',
  'jedi',
  'skywalker',
  'darth',
  'yoda',
  'mandalorian',
  'marvel',
  'avengers',
  'iron man',
  'spider-man',
  'thor',
  'captain america',
  'hulk',
  'thanos',
  'wanda',
  'tron',
  'epcot',
  'disneyland',
];

type OtdbQuestion = {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type OtdbResponse = { response_code: number; results: OtdbQuestion[] };

function decode(s: string): string {
  // Open Trivia DB returns HTML-entity-encoded strings
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&Eacute;/g, 'É')
    .replace(/&iuml;/g, 'ï')
    .replace(/&ouml;/g, 'ö')
    .replace(/&hellip;/g, '…')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&shy;/g, '');
}

function matchesDisney(q: OtdbQuestion): boolean {
  // Require keyword in the question text or correct answer — not just distractors.
  // Distractor-only matches produce false positives (e.g. a Tarantino question
  // listing Star Wars actors as wrong answers).
  const primary = `${q.question} ${q.correct_answer}`.toLowerCase();
  return DISNEY_KEYWORDS.some((kw) => primary.includes(kw));
}

async function fetchBatch(categoryId: number, amount: number): Promise<OtdbQuestion[]> {
  // type=multiple drops boolean (True/False) questions — bad fit for flashcards
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`opentdb HTTP ${res.status}`);
  const data = (await res.json()) as OtdbResponse;
  if (data.response_code !== 0) {
    console.warn(`  opentdb response_code=${data.response_code}, returning empty`);
    return [];
  }
  return data.results;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function harvestCategory(categoryId: number, name: string) {
  const all = new Map<string, OtdbQuestion>(); // dedupe by question text
  // Open Trivia DB caps at 50 per request and rate-limits ~1 req/5s.
  // Use 6s between requests to be safe.
  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(6000);
    const batch = await fetchBatch(categoryId, 50);
    for (const q of batch) all.set(q.question, q);
  }
  const disney = Array.from(all.values()).filter(matchesDisney);
  return disney.map((q, i) => ({
    id: `otdb-${name}-${String(i + 1).padStart(3, '0')}`,
    prompt: decode(q.question),
    answer: decode(q.correct_answer),
    sourceUrl: 'https://opentdb.com',
  }));
}

async function main() {
  if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });
  for (const cat of CATEGORIES) {
    console.log(`Fetching ${cat.label}...`);
    const questions = await harvestCategory(cat.id, cat.name);
    if (questions.length === 0) {
      console.log(`  ${cat.name}: no Disney-matching questions, skipping write`);
      continue;
    }
    const isFilm = cat.name === 'film';
    const pack = {
      id: `opentdb-${cat.name}`,
      title: isFilm ? 'Open Trivia DB — Disney Films' : 'Open Trivia DB — Disney Cartoons',
      description: 'Crowd-sourced questions from opentdb.com, filtered for Disney content.',
      category: 'animated',
      difficulty: 'medium',
      source: 'opentdb',
      questions,
    };
    writeFileSync(join(DEST, `opentdb-${cat.name}.json`), JSON.stringify(pack, null, 2) + '\n');
    console.log(`  wrote ${questions.length} questions to opentdb-${cat.name}.json`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
