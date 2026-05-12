export const CATEGORIES = [
  'animated',
  'pixar',
  'parks',
  'live-action',
  'star-wars',
  'marvel',
  'disney-tv',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  animated: 'Animated',
  pixar: 'Pixar',
  parks: 'Parks',
  'live-action': 'Live-Action',
  'star-wars': 'Star Wars',
  marvel: 'Marvel',
  'disney-tv': 'Disney TV',
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; ring: string }> = {
  animated: { bg: 'bg-sky-100', text: 'text-sky-900', ring: 'ring-sky-300' },
  pixar: { bg: 'bg-amber-100', text: 'text-amber-900', ring: 'ring-amber-300' },
  parks: { bg: 'bg-emerald-100', text: 'text-emerald-900', ring: 'ring-emerald-300' },
  'live-action': { bg: 'bg-rose-100', text: 'text-rose-900', ring: 'ring-rose-300' },
  'star-wars': { bg: 'bg-slate-200', text: 'text-slate-900', ring: 'ring-slate-400' },
  marvel: { bg: 'bg-red-100', text: 'text-red-900', ring: 'ring-red-300' },
  'disney-tv': { bg: 'bg-violet-100', text: 'text-violet-900', ring: 'ring-violet-300' },
};

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
