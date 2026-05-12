import easyWins from "./disney-easy-wins.json";
import villains from "./disney-villains.json";
import pixarDeepCuts from "./pixar-deep-cuts.json";
import parks from "./disney-parks.json";
import princesses from "./disney-princesses.json";
import songs from "./disney-songs.json";
import disneyTv from "./disney-tv.json";
import marvel from "./marvel-mcu.json";
import starWars from "./star-wars-essentials.json";
import opentdbFilm from "./opentdb-film.json";
import type { Pack } from "@/lib/types";

// Add new packs here after running the seed scripts.
export const packs: Pack[] = [
  easyWins as Pack,
  princesses as Pack,
  villains as Pack,
  songs as Pack,
  pixarDeepCuts as Pack,
  parks as Pack,
  starWars as Pack,
  marvel as Pack,
  disneyTv as Pack,
  opentdbFilm as Pack,
];

export const MIX_PACK_ID = "mix";

/**
 * Virtual "mix" pack that unions every question across all packs.
 * Memoized so consumers get a stable reference (drill page depends on it).
 */
const MIX_PACK: Pack = {
  id: MIX_PACK_ID,
  title: "Mix All Packs",
  description: "Random questions pulled from every category.",
  category: "animated",
  difficulty: "medium",
  source: "curated",
  questions: packs.flatMap((p) => p.questions),
};

export function getMixPack(): Pack {
  return MIX_PACK;
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
