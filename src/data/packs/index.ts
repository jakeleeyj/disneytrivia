import easyWins from './disney-easy-wins.json';
import villains from './disney-villains.json';
import pixarDeepCuts from './pixar-deep-cuts.json';
import parks from './disney-parks.json';
import type { Pack } from '@/lib/types';

// Add new packs here after running the seed scripts.
export const packs: Pack[] = [
  easyWins as Pack,
  pixarDeepCuts as Pack,
  villains as Pack,
  parks as Pack,
];

export function getPackById(id: string): Pack | undefined {
  return packs.find((p) => p.id === id);
}
