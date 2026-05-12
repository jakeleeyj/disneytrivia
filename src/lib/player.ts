import { readJSON, writeJSON } from './storage';

const ROSTER_KEY = 'dt:players';
const CURRENT_KEY = 'dt:currentPlayer';

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export function getRoster(): string[] {
  return readJSON<string[]>(ROSTER_KEY, []);
}

export function getCurrentPlayer(): string | null {
  return readJSON<string | null>(CURRENT_KEY, null);
}

export function setCurrentPlayer(name: string): void {
  const roster = getRoster();
  const normalized = normalize(name);
  if (!roster.includes(normalized)) return;
  writeJSON(CURRENT_KEY, normalized);
}

export function addPlayer(name: string): string | null {
  const normalized = normalize(name);
  if (normalized === '') return null;
  const roster = getRoster();
  if (!roster.includes(normalized)) {
    roster.push(normalized);
    writeJSON(ROSTER_KEY, roster);
  }
  if (getCurrentPlayer() === null) {
    writeJSON(CURRENT_KEY, normalized);
  }
  return normalized;
}

export function removePlayer(name: string): void {
  const normalized = normalize(name);
  const roster = getRoster().filter((n) => n !== normalized);
  writeJSON(ROSTER_KEY, roster);
  if (getCurrentPlayer() === normalized) {
    writeJSON(CURRENT_KEY, roster[0] ?? null);
  }
}
