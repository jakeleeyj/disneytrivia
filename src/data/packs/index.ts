import easyWins from "./disney-easy-wins.json";
import villains from "./disney-villains.json";
import pixarDeepCuts from "./pixar-deep-cuts.json";
import parks from "./disney-parks.json";
import type { Pack } from "@/lib/types";

// Add new packs here after running the seed scripts.
export const packs: Pack[] = [
  easyWins as Pack,
  pixarDeepCuts as Pack,
  villains as Pack,
  parks as Pack,
];

export const MIX_PACK_ID = "mix";

/**
 * Virtual "mix" pack that unions every question across all packs.
 * Used by the home Mix tile and the mix drill route.
 */
export function getMixPack(): Pack {
  return {
    id: MIX_PACK_ID,
    title: "Mix All Packs",
    description: "Random questions pulled from every category.",
    category: "animated",
    difficulty: "medium",
    source: "curated",
    questions: packs.flatMap((p) => p.questions),
  };
}

/**
 * Map every question id to its origin pack id. Used by mix mode when
 * recording attempts so per-pack/category stats stay correct.
 */
export function buildOriginPackMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const pack of packs) {
    for (const q of pack.questions) map.set(q.id, pack.id);
  }
  return map;
}

export function getPackById(id: string): Pack | undefined {
  if (id === MIX_PACK_ID) return getMixPack();
  return packs.find((p) => p.id === id);
}
