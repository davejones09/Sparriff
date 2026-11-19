import { dayKey, isPayday, type SparState } from './logic';
import { TIPS, type Tip, type TipWhen } from './tips';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Welche besonderen Situationen gerade zutreffen – wichtigste zuerst. */
export function tipSituations(state: SparState, now: Date): TipWhen[] {
  const out: TipWhen[] = [];
  const since = (days: number) => now.getTime() - days * DAY_MS;
  const recent = state.moments.filter((m) => new Date(m.createdAt).getTime() >= since(14));
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (isPayday(state.settings, now)) out.push('zahltag');
  if (state.moments.some((m) => m.kind === 'extra' && new Date(m.createdAt).getTime() >= since(7))) out.push('extra');
  if (now.getDate() > lastDay - 4) out.push('monatsende');
  if (recent.filter((m) => /liefer/i.test(m.label)).length >= 2) out.push('lieferdienst');
  if (recent.filter((m) => /coffee|kaffee/i.test(m.label)).length >= 2) out.push('kaffee');
  if (now.getMonth() === 11) out.push('dezember');
  if (now.getDay() === 5 || now.getDay() === 6) out.push('wochenende');
  return out;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909);
    const j = (s >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Reihenfolge der Tipps für heute: erst passende zur Situation, dann allgemeine.
 * Gleicher Tag = gleiche Reihenfolge; „Noch einer“ geht einfach weiter.
 */
export function tipsForToday(state: SparState, now: Date): Tip[] {
  const situations = tipSituations(state, now);
  const seed = hash(dayKey(now));
  const special = situations.flatMap((w) => shuffled(TIPS.filter((t) => t.when === w), seed));
  const general = shuffled(
    TIPS.filter((t) => t.when === 'allgemein'),
    seed,
  );
  return [...special, ...general];
}

export function tipById(id: number): Tip | undefined {
  return TIPS.find((t) => t.id === id);
}
