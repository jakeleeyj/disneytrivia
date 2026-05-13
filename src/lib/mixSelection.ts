import { readJSON, writeJSON } from "./storage";

const key = (player: string) => `dt:mixPacks:${player}`;

/**
 * Returns the pack IDs the player has chosen for their mix drill.
 * Falls back to `defaultIds` (typically all packs) when no selection
 * has been saved yet, so first-time players still see everything.
 */
export function getMixSelection(
  player: string,
  defaultIds: string[],
): string[] {
  const raw = readJSON<string[] | null>(key(player), null);
  if (!raw || raw.length === 0) return defaultIds;
  // drop any stale ids that no longer exist in the registry
  const valid = raw.filter((id) => defaultIds.includes(id));
  return valid.length > 0 ? valid : defaultIds;
}

export function setMixSelection(player: string, ids: string[]): void {
  writeJSON(key(player), ids);
}
