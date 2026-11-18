// Reine Spar- und Belohnungslogik – ohne React Native, damit sie testbar bleibt.

export const MOMENT_SHELLS = 10;
export const SECURED_SHELLS = 25;
export const WEEKLY_SHELLS = 50;
export const GOAL_SHELLS = 500;
export const DAILY_REWARD_LIMIT = 5;

export type MomentKind = 'verzicht' | 'einzahlung';
export type MomentStatus = 'gemerkt' | 'gesichert';

export interface SparMoment {
  id: string;
  kind: MomentKind;
  label: string;
  amountCents: number;
  status: MomentStatus;
  createdAt: string;
  securedAt?: string;
  /** Hat dieser Moment Muscheln gebracht (Tageslimit)? */
  rewarded: boolean;
}

export interface Goal {
  name: string;
  targetCents: number;
  /** YYYY-MM-DD */
  dueDate: string;
  /** Anteil des Gesparten, der in die Schatztruhe geht (0–50). */
  treasurePercent: number;
  createdAt: string;
}

export type RewardType = 'moment' | 'gesichert' | 'wochenrate' | 'ziel';

export interface Reward {
  id: string;
  type: RewardType;
  shells: number;
  at: string;
  /** Moment-ID, Wochen-Schlüssel oder Ziel-Zeitstempel */
  ref: string;
}

export interface Settings {
  /** Tag im Monat, 1–28 */
  paydayDay: number;
  reminderHour: number;
  remindersEnabled: boolean;
}

export interface SparState {
  goal: Goal | null;
  moments: SparMoment[];
  rewards: Reward[];
  settings: Settings;
}

export const initialState: SparState = {
  goal: null,
  moments: [],
  rewards: [],
  settings: { paydayDay: 1, reminderHour: 9, remindersEnabled: false },
};

// ---------- Level & Tiere ----------

export interface Level {
  index: number;
  name: string;
  min: number;
}

export const LEVELS: readonly Level[] = [
  { index: 0, name: 'Sandbank', min: 0 },
  { index: 1, name: 'Seegraswiese', min: 200 },
  { index: 2, name: 'Jungriff', min: 600 },
  { index: 3, name: 'Korallengarten', min: 1500 },
  { index: 4, name: 'Barriereriff', min: 3500 },
];

export interface LevelInfo {
  level: Level;
  next: Level | null;
  /** Fortschritt zum nächsten Level, 0–1 */
  progress: number;
}

export function levelFor(shells: number): LevelInfo {
  let level = LEVELS[0];
  for (const l of LEVELS) if (shells >= l.min) level = l;
  const next = LEVELS[level.index + 1] ?? null;
  const progress = next ? (shells - level.min) / (next.min - level.min) : 1;
  return { level, next, progress: clamp(progress, 0, 1) };
}

export type AnimalId = 'clownfisch' | 'seepferdchen' | 'schildkroete';

export interface Animal {
  id: AnimalId;
  name: string;
  hint: string;
}

export const ANIMALS: readonly Animal[] = [
  { id: 'clownfisch', name: 'Clownfisch', hint: 'Dein erster Spar-Moment' },
  { id: 'seepferdchen', name: 'Seepferdchen', hint: 'Dein erster gesicherter Spar-Moment' },
  { id: 'schildkroete', name: 'Meeresschildkröte', hint: 'Dein erster gesicherter Hunderter' },
];

export function unlockedAnimals(state: SparState): AnimalId[] {
  const ids: AnimalId[] = [];
  if (state.moments.length > 0) ids.push('clownfisch');
  const secured = state.moments.filter((m) => m.status === 'gesichert');
  if (secured.length > 0) ids.push('seepferdchen');
  if (sum(secured.map((m) => m.amountCents)) >= 100_00) ids.push('schildkroete');
  return ids;
}

// ---------- Ergebnis einer Aktion ----------

export interface Gain {
  shells: number;
  rewards: Reward[];
  newAnimals: Animal[];
  levelUp: Level | null;
}

export interface Result {
  state: SparState;
  gain: Gain;
}

function finish(before: SparState, after: SparState): Result {
  const beforeIds = new Set(before.rewards.map((r) => r.id));
  const rewards = after.rewards.filter((r) => !beforeIds.has(r.id));
  const shells = sum(rewards.map((r) => r.shells));
  const animalsBefore = new Set(unlockedAnimals(before));
  const newAnimals = ANIMALS.filter(
    (a) => unlockedAnimals(after).includes(a.id) && !animalsBefore.has(a.id),
  );
  const lvBefore = levelFor(totalShells(before)).level;
  const lvAfter = levelFor(totalShells(after)).level;
  return {
    state: after,
    gain: { shells, rewards, newAnimals, levelUp: lvAfter.index > lvBefore.index ? lvAfter : null },
  };
}

// ---------- Aktionen ----------

export interface MomentInput {
  kind: MomentKind;
  label: string;
  amountCents: number;
}

export function addMoment(state: SparState, input: MomentInput, now: Date, id: string): Result {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('Betrag muss größer als 0 sein');
  }
  const at = now.toISOString();
  const today = dayKey(now);
  const rewardedToday = state.moments.filter(
    (m) => m.rewarded && dayKey(new Date(m.createdAt)) === today,
  ).length;
  const rewarded = rewardedToday < DAILY_REWARD_LIMIT;
  const secured = input.kind === 'einzahlung';

  const moment: SparMoment = {
    id,
    kind: input.kind,
    label: input.label.trim() || (secured ? 'Einzahlung' : 'Verzicht'),
    amountCents: input.amountCents,
    status: secured ? 'gesichert' : 'gemerkt',
    createdAt: at,
    securedAt: secured ? at : undefined,
    rewarded,
  };

  const rewards = [...state.rewards];
  if (rewarded) {
    rewards.push({ id: `${id}:moment`, type: 'moment', shells: MOMENT_SHELLS, at, ref: id });
    if (secured) {
      rewards.push({ id: `${id}:gesichert`, type: 'gesichert', shells: SECURED_SHELLS, at, ref: id });
    }
  }

  let next: SparState = { ...state, moments: [moment, ...state.moments], rewards };
  if (secured) next = applyBonuses(next, now);
  return finish(state, next);
}

export function secureMoments(state: SparState, ids: string[], now: Date): Result {
  const at = now.toISOString();
  const wanted = new Set(ids);
  const rewards = [...state.rewards];
  const moments = state.moments.map((m) => {
    if (!wanted.has(m.id) || m.status === 'gesichert') return m;
    if (m.rewarded) {
      rewards.push({ id: `${m.id}:gesichert`, type: 'gesichert', shells: SECURED_SHELLS, at, ref: m.id });
    }
    return { ...m, status: 'gesichert' as const, securedAt: at };
  });
  const next = applyBonuses({ ...state, moments, rewards }, now);
  return finish(state, next);
}

export function deleteMoment(state: SparState, id: string): SparState {
  return {
    ...state,
    moments: state.moments.filter((m) => m.id !== id),
    rewards: state.rewards.filter((r) => r.ref !== id),
  };
}

export interface GoalInput {
  name: string;
  targetCents: number;
  dueDate: string;
  treasurePercent: number;
}

export function setGoal(state: SparState, input: GoalInput, now: Date): SparState {
  // Ziel nur anpassen (Name/Betrag/Datum) behält den Startzeitpunkt bei.
  const createdAt = state.goal?.createdAt ?? now.toISOString();
  return {
    ...state,
    goal: {
      name: input.name.trim() || 'Mein Sparziel',
      targetCents: input.targetCents,
      dueDate: input.dueDate,
      treasurePercent: clamp(Math.round(input.treasurePercent), 0, 50),
      createdAt,
    },
  };
}

/** Beginnt ein neues Ziel – der Fortschritt startet bei 0. */
export function startNewGoal(state: SparState, input: GoalInput, now: Date): SparState {
  return setGoal({ ...state, goal: null }, input, now);
}

function applyBonuses(state: SparState, now: Date): SparState {
  const goal = state.goal;
  if (!goal) return state;
  const at = now.toISOString();
  const rewards = [...state.rewards];

  const wk = weekKey(now);
  const hasWeekly = rewards.some((r) => r.type === 'wochenrate' && r.ref === wk);
  if (!hasWeekly && securedInWeek(state, now) >= weeklyRateCents(goal)) {
    rewards.push({ id: `wochenrate:${wk}`, type: 'wochenrate', shells: WEEKLY_SHELLS, at, ref: wk });
  }

  const hasGoal = rewards.some((r) => r.type === 'ziel' && r.ref === goal.createdAt);
  if (!hasGoal && securedForGoal(state) >= goal.targetCents) {
    rewards.push({ id: `ziel:${goal.createdAt}`, type: 'ziel', shells: GOAL_SHELLS, at, ref: goal.createdAt });
  }
  return { ...state, rewards };
}

// ---------- Auswertungen ----------

export function totalShells(state: SparState): number {
  return sum(state.rewards.map((r) => r.shells));
}

export function weeklyRateCents(goal: Goal): number {
  const start = startOfDay(new Date(goal.createdAt)).getTime();
  const due = parseDayKey(goal.dueDate).getTime();
  const weeks = Math.max(1, Math.ceil((due - start) / (7 * DAY_MS)));
  return Math.ceil(goal.targetCents / weeks);
}

export function securedForGoal(state: SparState): number {
  if (!state.goal) return 0;
  const since = new Date(state.goal.createdAt).getTime();
  return sum(
    state.moments
      .filter((m) => m.status === 'gesichert' && m.securedAt && new Date(m.securedAt).getTime() >= since)
      .map((m) => m.amountCents),
  );
}

export function securedInWeek(state: SparState, now: Date): number {
  const from = startOfWeek(now).getTime();
  const to = from + 7 * DAY_MS;
  return sum(
    state.moments
      .filter((m) => {
        if (m.status !== 'gesichert' || !m.securedAt) return false;
        const t = new Date(m.securedAt).getTime();
        return t >= from && t < to;
      })
      .map((m) => m.amountCents),
  );
}

export interface GoalProgress {
  securedCents: number;
  fraction: number;
  weeklyRateCents: number;
  thisWeekCents: number;
  treasureCents: number;
  reached: boolean;
}

export function goalProgress(state: SparState, now: Date): GoalProgress | null {
  const goal = state.goal;
  if (!goal) return null;
  const securedCents = securedForGoal(state);
  return {
    securedCents,
    fraction: clamp(securedCents / goal.targetCents, 0, 1),
    weeklyRateCents: weeklyRateCents(goal),
    thisWeekCents: securedInWeek(state, now),
    treasureCents: Math.round((securedCents * goal.treasurePercent) / 100),
    reached: securedCents >= goal.targetCents,
  };
}

export interface Totals {
  weekCents: number;
  monthCents: number;
  openCents: number;
  securedCents: number;
  /** Hochrechnung aufs Jahr anhand des bisherigen Tempos */
  yearProjectionCents: number;
}

export function totals(state: SparState, now: Date): Totals {
  const weekFrom = startOfWeek(now).getTime();
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  let weekCents = 0;
  let monthCents = 0;
  let openCents = 0;
  let securedCents = 0;
  let first = Infinity;
  for (const m of state.moments) {
    const t = new Date(m.createdAt).getTime();
    first = Math.min(first, t);
    if (t >= weekFrom) weekCents += m.amountCents;
    if (t >= monthFrom) monthCents += m.amountCents;
    if (m.status === 'gemerkt') openCents += m.amountCents;
    else securedCents += m.amountCents;
  }
  const all = openCents + securedCents;
  const days = first === Infinity ? 0 : Math.max(7, (now.getTime() - first) / DAY_MS);
  const yearProjectionCents = days === 0 ? 0 : Math.round((all / days) * 365);
  return { weekCents, monthCents, openCents, securedCents, yearProjectionCents };
}

export function isPayday(settings: Settings, now: Date): boolean {
  return now.getDate() === settings.paydayDay;
}

// ---------- Datum & Geld ----------

const DAY_MS = 24 * 60 * 60 * 1000;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Lokales Datum als YYYY-MM-DD */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Montag 00:00 Uhr der Woche (lokal) */
export function startOfWeek(d: Date): Date {
  const day = startOfDay(d);
  const offset = (day.getDay() + 6) % 7;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() - offset);
}

/** ISO-Wochenschlüssel, z. B. 2026-W47 */
export function weekKey(d: Date): string {
  const t = startOfDay(d);
  const thursday = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((thursday.getTime() - firstThursday.getTime()) / DAY_MS - 3 + ((firstThursday.getDay() + 6) % 7)) / 7,
    );
  return `${thursday.getFullYear()}-W${pad(week)}`;
}

/** "3,50" | "3.50" | "3" | "1.234,56" → Cent, sonst null */
export function parseEuro(text: string): number | null {
  const cleaned = text.replace(/[€\s]/g, '');
  if (!cleaned) return null;
  let normalized = cleaned;
  if (cleaned.includes(',')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, '');
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}

export function formatEuro(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}${euros},${pad(abs % 100)} €`;
}

/** "TT.MM.JJJJ" → YYYY-MM-DD, sonst null */
export function parseGermanDate(text: string): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return dayKey(date);
}

export function formatGermanDate(key: string): string {
  const [y, m, d] = key.split('-');
  return `${d}.${m}.${y}`;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
