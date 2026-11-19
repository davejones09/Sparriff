// Reine Spar- und Belohnungslogik – ohne React Native, damit sie testbar bleibt.

export const MOMENT_SHELLS = 10;
export const SECURED_SHELLS = 25;
export const WEEKLY_SHELLS = 50;
export const GOAL_SHELLS = 500;
export const DAILY_REWARD_LIMIT = 5;

/** verzicht = nicht gekauft (gemerkt), einzahlung = zur Seite gelegt, extra = Sonderzahlung wie Weihnachtsgeld */
export type MomentKind = 'verzicht' | 'einzahlung' | 'extra';
export type MomentStatus = 'gemerkt' | 'gesichert';

export interface SparMoment {
  id: string;
  kind: MomentKind;
  label: string;
  amountCents: number;
  status: MomentStatus;
  createdAt: string;
  securedAt?: string;
  /** In welches Ziel das Geld beim Sichern ging */
  goalId?: string;
  /** Hat dieser Moment Muscheln gebracht (Tageslimit)? */
  rewarded: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetCents: number;
  /** YYYY-MM-DD */
  dueDate: string;
  createdAt: string;
  reachedAt?: string;
  /** Abzeichen: mindestens 2 Wochen vor dem Termin erreicht */
  early?: boolean;
}

export type RewardType = 'moment' | 'gesichert' | 'wochenrate' | 'ziel' | 'duplikat';

export interface Reward {
  id: string;
  type: RewardType;
  shells: number;
  at: string;
  /** Moment-ID, `${zielId}:${woche}`, Ziel-ID oder Truhen-ID */
  ref: string;
}

export interface Settings {
  /** Tag im Monat, 1–28 */
  paydayDay: number;
  reminderHour: number;
  remindersEnabled: boolean;
  /** Tutorial schon gesehen? Beim ersten Start false. */
  tutorialSeen: boolean;
}

// ---------- Tiere ----------

export type Rarity = 'start' | 'haeufig' | 'selten' | 'sehr-selten';

export const RARITY_LABEL: Record<Rarity, string> = {
  start: 'Start-Tier',
  haeufig: 'Häufig',
  selten: 'Selten',
  'sehr-selten': 'Sehr selten',
};

export type AnimalId =
  | 'clownfisch'
  | 'seepferdchen'
  | 'schildkroete'
  | 'doktorfisch'
  | 'kugelfisch'
  | 'feuerfisch'
  | 'kaiserfisch'
  | 'papageifisch'
  | 'riffbarsch-schwarm'
  | 'seestern'
  | 'qualle'
  | 'einsiedlerkrebs'
  | 'schwarzspitzen-riffhai'
  | 'oktopus'
  | 'muraene'
  | 'adlerrochen'
  | 'engelhai'
  | 'hammerhai'
  | 'mantarochen'
  | 'orca'
  | 'weisser-hai'
  | 'grindwal'
  | 'pottwal'
  | 'walhai'
  | 'delfin';

export interface Animal {
  id: AnimalId;
  name: string;
  rarity: Rarity;
  /** Wie man es bekommt – nur bei Start-Tieren, sonst aus Truhen */
  hint?: string;
}

export const ANIMALS: readonly Animal[] = [
  { id: 'clownfisch', name: 'Clownfisch', rarity: 'start', hint: 'Dein erster Spar-Moment' },
  { id: 'seepferdchen', name: 'Seepferdchen', rarity: 'start', hint: 'Dein erster gesicherter Spar-Moment' },
  { id: 'schildkroete', name: 'Meeresschildkröte', rarity: 'start', hint: 'Dein erster gesicherter Hunderter' },
  { id: 'doktorfisch', name: 'Paletten-Doktorfisch', rarity: 'haeufig' },
  { id: 'kugelfisch', name: 'Kugelfisch', rarity: 'haeufig' },
  { id: 'feuerfisch', name: 'Feuerfisch', rarity: 'haeufig' },
  { id: 'kaiserfisch', name: 'Kaiserfisch', rarity: 'haeufig' },
  { id: 'papageifisch', name: 'Papageifisch', rarity: 'haeufig' },
  { id: 'riffbarsch-schwarm', name: 'Fahnenbarsch-Schwarm', rarity: 'haeufig' },
  { id: 'seestern', name: 'Seestern', rarity: 'haeufig' },
  { id: 'qualle', name: 'Qualle', rarity: 'haeufig' },
  { id: 'einsiedlerkrebs', name: 'Einsiedlerkrebs', rarity: 'haeufig' },
  { id: 'schwarzspitzen-riffhai', name: 'Schwarzspitzen-Riffhai', rarity: 'haeufig' },
  { id: 'oktopus', name: 'Oktopus', rarity: 'selten' },
  { id: 'muraene', name: 'Muräne', rarity: 'selten' },
  { id: 'adlerrochen', name: 'Adlerrochen', rarity: 'selten' },
  { id: 'engelhai', name: 'Engelhai', rarity: 'selten' },
  { id: 'hammerhai', name: 'Hammerhai', rarity: 'selten' },
  { id: 'mantarochen', name: 'Mantarochen', rarity: 'selten' },
  { id: 'orca', name: 'Orca', rarity: 'sehr-selten' },
  { id: 'weisser-hai', name: 'Weißer Hai', rarity: 'sehr-selten' },
  { id: 'grindwal', name: 'Indischer Grindwal', rarity: 'sehr-selten' },
  { id: 'pottwal', name: 'Pottwal', rarity: 'sehr-selten' },
  { id: 'walhai', name: 'Walhai', rarity: 'sehr-selten' },
  { id: 'delfin', name: 'Großer Tümmler', rarity: 'sehr-selten' },
];

export function animal(id: AnimalId): Animal {
  return ANIMALS.find((a) => a.id === id)!;
}

// ---------- Truhen ----------

export type ChestKind = 'klein' | 'gross';

export interface Chest {
  id: string;
  kind: ChestKind;
  /** Wofür: Wochenrate oder erreichtes Ziel */
  reason: string;
  at: string;
  openedAt?: string;
  animal?: AnimalId;
  duplicate?: boolean;
  shells?: number;
}

/** Wahrscheinlichkeiten je Truhe */
export const CHEST_ODDS: Record<ChestKind, [Rarity, number][]> = {
  klein: [
    ['haeufig', 0.75],
    ['selten', 0.22],
    ['sehr-selten', 0.03],
  ],
  gross: [
    ['selten', 0.6],
    ['sehr-selten', 0.4],
  ],
};

/** Muscheln, wenn ein Tier doppelt kommt */
export const DUPLICATE_SHELLS: Record<Rarity, number> = { start: 30, haeufig: 30, selten: 80, 'sehr-selten': 200 };

// ---------- Zustand ----------

export interface SparState {
  goals: Goal[];
  primaryGoalId: string | null;
  moments: SparMoment[];
  rewards: Reward[];
  chests: Chest[];
  /** Tiere aus Truhen */
  collection: AnimalId[];
  settings: Settings;
}

export const initialState: SparState = {
  goals: [],
  primaryGoalId: null,
  moments: [],
  rewards: [],
  chests: [],
  collection: [],
  settings: { paydayDay: 1, reminderHour: 9, remindersEnabled: false, tutorialSeen: false },
};

// ---------- Level ----------

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

/** Alle Tiere im Riff, neueste zuletzt. */
export function unlockedAnimals(state: SparState): AnimalId[] {
  const ids: AnimalId[] = [];
  if (state.moments.length > 0) ids.push('clownfisch');
  const secured = state.moments.filter((m) => m.status === 'gesichert');
  if (secured.length > 0) ids.push('seepferdchen');
  if (sum(secured.map((m) => m.amountCents)) >= 100_00) ids.push('schildkroete');
  for (const id of state.collection) if (!ids.includes(id)) ids.push(id);
  return ids;
}

// ---------- Ergebnis einer Aktion ----------

export interface Gain {
  shells: number;
  rewards: Reward[];
  newAnimals: Animal[];
  newChests: Chest[];
  /** Ziele, die gerade das Frühstarter-Abzeichen bekommen haben */
  newBadges: Goal[];
  levelUp: Level | null;
  /** Nur beim Öffnen einer Truhe */
  opened?: Chest;
}

export interface Result {
  state: SparState;
  gain: Gain;
}

function finish(before: SparState, after: SparState, opened?: Chest): Result {
  const beforeIds = new Set(before.rewards.map((r) => r.id));
  const rewards = after.rewards.filter((r) => !beforeIds.has(r.id));
  const chestIds = new Set(before.chests.map((c) => c.id));
  const animalsBefore = new Set(unlockedAnimals(before));
  const newAnimals = unlockedAnimals(after)
    .filter((id) => !animalsBefore.has(id))
    .map(animal);
  const lvBefore = levelFor(totalShells(before)).level;
  const lvAfter = levelFor(totalShells(after)).level;
  return {
    state: after,
    gain: {
      shells: sum(rewards.map((r) => r.shells)),
      rewards,
      newAnimals,
      newChests: after.chests.filter((c) => !chestIds.has(c.id)),
      newBadges: after.goals.filter((g) => g.early && !before.goals.find((b) => b.id === g.id)?.early),
      levelUp: lvAfter.index > lvBefore.index ? lvAfter : null,
      opened,
    },
  };
}

// ---------- Spar-Momente ----------

export interface MomentInput {
  kind: MomentKind;
  label: string;
  amountCents: number;
  /** Für „Zur Seite gelegt“: in welches Ziel; Standard ist das Hauptziel */
  goalId?: string | null;
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
  const secured = input.kind !== 'verzicht';
  const goalId = secured ? resolveGoal(state, input.goalId) : undefined;

  const moment: SparMoment = {
    id,
    kind: input.kind,
    label: input.label.trim() || DEFAULT_LABEL[input.kind],
    amountCents: input.amountCents,
    status: secured ? 'gesichert' : 'gemerkt',
    createdAt: at,
    securedAt: secured ? at : undefined,
    goalId,
    rewarded,
  };

  const rewards = [...state.rewards];
  if (rewarded) {
    rewards.push({ id: `${id}:moment`, type: 'moment', shells: MOMENT_SHELLS, at, ref: id });
    if (secured) rewards.push({ id: `${id}:gesichert`, type: 'gesichert', shells: SECURED_SHELLS, at, ref: id });
  }

  let next: SparState = { ...state, moments: [moment, ...state.moments], rewards };
  if (goalId) next = applyBonuses(next, goalId, now);
  return finish(state, next);
}

const DEFAULT_LABEL: Record<MomentKind, string> = {
  verzicht: 'Verzicht',
  einzahlung: 'Zur Seite gelegt',
  extra: 'Extra-Geld',
};

export interface ExtraInput {
  label: string;
  /** Aufteilung auf Ziele; `goalId: null` = Hauptziel */
  parts: { goalId: string | null; amountCents: number }[];
}

/**
 * Extra-Geld (Weihnachtsgeld, Zulage …) – gilt sofort als gesichert und kann auf
 * mehrere Ziele verteilt werden. Muscheln gibt es einmal (+10 +25), egal wie viel.
 */
export function addExtra(state: SparState, input: ExtraInput, now: Date, idBase: string): Result {
  const parts = input.parts.filter((p) => p.amountCents > 0);
  if (parts.length === 0 || parts.some((p) => !Number.isInteger(p.amountCents))) {
    throw new Error('Betrag muss größer als 0 sein');
  }
  const at = now.toISOString();
  const today = dayKey(now);
  const rewardedToday = state.moments.filter(
    (m) => m.rewarded && dayKey(new Date(m.createdAt)) === today,
  ).length;
  const label = input.label.trim() || DEFAULT_LABEL.extra;

  const moments: SparMoment[] = parts.map((p, i) => ({
    id: `${idBase}-${i}`,
    kind: 'extra',
    label,
    amountCents: p.amountCents,
    status: 'gesichert',
    createdAt: at,
    securedAt: at,
    goalId: resolveGoal(state, p.goalId),
    rewarded: i === 0 && rewardedToday < DAILY_REWARD_LIMIT,
  }));

  const rewards = [...state.rewards];
  const first = moments[0];
  if (first.rewarded) {
    rewards.push({ id: `${first.id}:moment`, type: 'moment', shells: MOMENT_SHELLS, at, ref: first.id });
    rewards.push({ id: `${first.id}:gesichert`, type: 'gesichert', shells: SECURED_SHELLS, at, ref: first.id });
  }

  let next: SparState = { ...state, moments: [...moments, ...state.moments], rewards };
  for (const goalId of new Set(moments.map((m) => m.goalId))) {
    if (goalId) next = applyBonuses(next, goalId, now);
  }
  return finish(state, next);
}

/** Sichert gemerkte Momente und ordnet sie einem Ziel zu (Standard: Hauptziel). */
export function secureMoments(state: SparState, ids: string[], goalId: string | null | undefined, now: Date): Result {
  const at = now.toISOString();
  const target = resolveGoal(state, goalId);
  const wanted = new Set(ids);
  const rewards = [...state.rewards];
  const moments = state.moments.map((m) => {
    if (!wanted.has(m.id) || m.status === 'gesichert') return m;
    if (m.rewarded) {
      rewards.push({ id: `${m.id}:gesichert`, type: 'gesichert', shells: SECURED_SHELLS, at, ref: m.id });
    }
    return { ...m, status: 'gesichert' as const, securedAt: at, goalId: target };
  });
  let next: SparState = { ...state, moments, rewards };
  if (target) next = applyBonuses(next, target, now);
  return finish(state, next);
}

export function deleteMoment(state: SparState, id: string): SparState {
  return {
    ...state,
    moments: state.moments.filter((m) => m.id !== id),
    rewards: state.rewards.filter((r) => r.ref !== id),
  };
}

function resolveGoal(state: SparState, goalId: string | null | undefined): string | undefined {
  if (goalId && state.goals.some((g) => g.id === goalId)) return goalId;
  return state.primaryGoalId ?? state.goals[0]?.id ?? undefined;
}

// ---------- Ziele ----------

export interface GoalInput {
  name: string;
  targetCents: number;
  dueDate: string;
}

export function addGoal(state: SparState, input: GoalInput, now: Date, id: string): SparState {
  const goal: Goal = {
    id,
    name: input.name.trim() || 'Mein Sparziel',
    targetCents: input.targetCents,
    dueDate: input.dueDate,
    createdAt: now.toISOString(),
  };
  return { ...state, goals: [...state.goals, goal], primaryGoalId: state.primaryGoalId ?? id };
}

export function updateGoal(state: SparState, id: string, input: GoalInput): SparState {
  return {
    ...state,
    goals: state.goals.map((g) =>
      g.id === id
        ? { ...g, name: input.name.trim() || g.name, targetCents: input.targetCents, dueDate: input.dueDate }
        : g,
    ),
  };
}

/** Löscht ein Ziel. Gesichertes Geld bleibt gesichert, gehört dann aber zu keinem Ziel mehr. */
export function deleteGoal(state: SparState, id: string): SparState {
  const goals = state.goals.filter((g) => g.id !== id);
  return {
    ...state,
    goals,
    primaryGoalId: state.primaryGoalId === id ? (goals.find((g) => !g.reachedAt)?.id ?? goals[0]?.id ?? null) : state.primaryGoalId,
    moments: state.moments.map((m) => (m.goalId === id ? { ...m, goalId: undefined } : m)),
  };
}

export function setPrimaryGoal(state: SparState, id: string): SparState {
  return state.goals.some((g) => g.id === id) ? { ...state, primaryGoalId: id } : state;
}

function applyBonuses(state: SparState, goalId: string, now: Date): SparState {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return state;
  const at = now.toISOString();
  const rewards = [...state.rewards];
  const chests = [...state.chests];
  let goals = state.goals;

  const wk = weekKey(now);
  const weekRef = `${goalId}:${wk}`;
  const hasWeekly = rewards.some((r) => r.type === 'wochenrate' && r.ref === weekRef);
  const rate = weeklyRateCents(state, goal, now);
  if (!hasWeekly && rate > 0 && securedInWeek(state, goalId, now) >= rate) {
    rewards.push({ id: `wochenrate:${weekRef}`, type: 'wochenrate', shells: WEEKLY_SHELLS, at, ref: weekRef });
    chests.push({ id: `truhe:${weekRef}`, kind: 'klein', reason: `Wochenrate ${goal.name}`, at });
  }

  const hasGoal = rewards.some((r) => r.type === 'ziel' && r.ref === goalId);
  if (!hasGoal && securedForGoal(state, goalId) >= goal.targetCents) {
    rewards.push({ id: `ziel:${goalId}`, type: 'ziel', shells: GOAL_SHELLS, at, ref: goalId });
    chests.push({ id: `truhe:${goalId}:ziel`, kind: 'gross', reason: `Ziel erreicht: ${goal.name}`, at });
    const early =
      parseDayKey(goal.dueDate).getTime() - now.getTime() >= EARLY_MS &&
      now.getTime() - new Date(goal.createdAt).getTime() >= EARLY_MS;
    goals = goals.map((g) => (g.id === goalId ? { ...g, reachedAt: at, early } : g));
  }
  return { ...state, rewards, chests, goals };
}

// ---------- Truhe öffnen ----------

/** Öffnet eine Truhe. `random` liefert Zahlen in [0, 1) – austauschbar für Tests. */
export function openChest(state: SparState, chestId: string, now: Date, random: () => number = Math.random): Result {
  const chest = state.chests.find((c) => c.id === chestId);
  if (!chest || chest.openedAt) return finish(state, state);

  const roll = random();
  let acc = 0;
  let rarity: Rarity = CHEST_ODDS[chest.kind][0][0];
  for (const [r, p] of CHEST_ODDS[chest.kind]) {
    acc += p;
    if (roll < acc) {
      rarity = r;
      break;
    }
  }
  const pool = ANIMALS.filter((a) => a.rarity === rarity);
  const owned = new Set(state.collection);
  const fresh = pool.filter((a) => !owned.has(a.id));
  const from = fresh.length > 0 ? fresh : pool;
  const picked = from[Math.min(from.length - 1, Math.floor(random() * from.length))];
  const duplicate = fresh.length === 0;
  const shells = duplicate ? DUPLICATE_SHELLS[rarity] : 0;
  const at = now.toISOString();

  const opened: Chest = { ...chest, openedAt: at, animal: picked.id, duplicate, shells };
  const next: SparState = {
    ...state,
    chests: state.chests.map((c) => (c.id === chestId ? opened : c)),
    collection: duplicate ? state.collection : [...state.collection, picked.id],
    rewards: duplicate
      ? [...state.rewards, { id: `duplikat:${chestId}`, type: 'duplikat', shells, at, ref: chestId }]
      : state.rewards,
  };
  return finish(state, next, opened);
}

export function closedChests(state: SparState): Chest[] {
  return state.chests.filter((c) => !c.openedAt);
}

// ---------- Auswertungen ----------

export function totalShells(state: SparState): number {
  return sum(state.rewards.map((r) => r.shells));
}

/** Frühstarter: mindestens 2 Wochen vor dem Termin – und das Ziel lief mindestens 2 Wochen */
const EARLY_MS = 14 * 24 * 60 * 60 * 1000;

/** Wochenrate beim Anlegen des Ziels */
export function initialWeeklyRateCents(goal: Goal): number {
  const start = startOfDay(new Date(goal.createdAt)).getTime();
  const due = parseDayKey(goal.dueDate).getTime();
  const weeks = Math.max(1, Math.ceil((due - start) / (7 * DAY_MS)));
  return Math.ceil(goal.targetCents / weeks);
}

/**
 * Aktuelle Wochenrate: was zu Wochenbeginn noch fehlte, verteilt auf die restlichen Wochen.
 * Extra-Geld senkt sie also ab der nächsten Woche. Innerhalb einer Woche bleibt sie stabil.
 */
export function weeklyRateCents(state: SparState, goal: Goal, now: Date): number {
  const weekStart = startOfWeek(now).getTime();
  const from = Math.max(weekStart, startOfDay(new Date(goal.createdAt)).getTime());
  const due = parseDayKey(goal.dueDate).getTime();
  const weeks = Math.max(1, Math.ceil((due - from) / (7 * DAY_MS)));
  const before = sum(
    state.moments
      .filter((m) => m.status === 'gesichert' && m.goalId === goal.id && m.securedAt && new Date(m.securedAt).getTime() < weekStart)
      .map((m) => m.amountCents),
  );
  return Math.max(0, Math.ceil((goal.targetCents - before) / weeks));
}

export interface Forecast {
  /** YYYY-MM-DD */
  date: string;
  /** positiv = früher als geplant */
  daysEarly: number;
}

/**
 * Wann ist das Ziel im bisherigen Tempo erreicht? Extra-Geld zählt zum Stand,
 * aber nicht zum Tempo – sonst würde ein Weihnachtsgeld jede Woche eingerechnet.
 */
export function goalForecast(state: SparState, goalId: string, now: Date): Forecast | null {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal || goal.reachedAt) return null;
  const mine = state.moments.filter((m) => m.status === 'gesichert' && m.goalId === goalId);
  const secured = sum(mine.map((m) => m.amountCents));
  const regular = sum(mine.filter((m) => m.kind !== 'extra').map((m) => m.amountCents));
  const days = Math.max(7, (now.getTime() - new Date(goal.createdAt).getTime()) / DAY_MS);
  const perDay = regular / days;
  const remaining = goal.targetCents - secured;
  if (remaining <= 0 || perDay <= 0) return null;
  const date = startOfDay(new Date(now.getTime() + Math.ceil(remaining / perDay) * DAY_MS));
  const daysEarly = Math.round((parseDayKey(goal.dueDate).getTime() - date.getTime()) / DAY_MS);
  return { date: dayKey(date), daysEarly };
}

export function securedForGoal(state: SparState, goalId: string): number {
  return sum(state.moments.filter((m) => m.status === 'gesichert' && m.goalId === goalId).map((m) => m.amountCents));
}

export function securedInWeek(state: SparState, goalId: string, now: Date): number {
  const from = startOfWeek(now).getTime();
  const to = from + 7 * DAY_MS;
  return sum(
    state.moments
      .filter((m) => {
        if (m.status !== 'gesichert' || !m.securedAt || m.goalId !== goalId) return false;
        const t = new Date(m.securedAt).getTime();
        return t >= from && t < to;
      })
      .map((m) => m.amountCents),
  );
}

export interface GoalProgress {
  goal: Goal;
  securedCents: number;
  fraction: number;
  weeklyRateCents: number;
  /** Rate beim Anlegen – zum Vergleich, wenn Extra-Geld sie gesenkt hat */
  initialWeeklyRateCents: number;
  thisWeekCents: number;
  reached: boolean;
  primary: boolean;
}

export function goalProgress(state: SparState, goalId: string, now: Date): GoalProgress | null {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return null;
  const securedCents = securedForGoal(state, goalId);
  return {
    goal,
    securedCents,
    fraction: clamp(securedCents / goal.targetCents, 0, 1),
    weeklyRateCents: weeklyRateCents(state, goal, now),
    initialWeeklyRateCents: initialWeeklyRateCents(goal),
    thisWeekCents: securedInWeek(state, goalId, now),
    reached: Boolean(goal.reachedAt) || securedCents >= goal.targetCents,
    primary: state.primaryGoalId === goalId,
  };
}

export function primaryGoal(state: SparState): Goal | null {
  return state.goals.find((g) => g.id === state.primaryGoalId) ?? null;
}

// ---------- Alte Daten (Version 1) übernehmen ----------

interface StateV1 {
  goal?: { name: string; targetCents: number; dueDate: string; createdAt: string } | null;
  moments?: Omit<SparMoment, 'goalId'>[];
  rewards?: Reward[];
  settings?: Partial<Settings>;
}

export function migrateFromV1(old: StateV1): SparState {
  const goalId = 'ziel-1';
  const g = old.goal ?? null;
  const since = g ? new Date(g.createdAt).getTime() : Infinity;
  const rewards = (old.rewards ?? []).map((r) => {
    if (!g) return r;
    if (r.type === 'ziel') return { ...r, id: `ziel:${goalId}`, ref: goalId };
    if (r.type === 'wochenrate') return { ...r, id: `wochenrate:${goalId}:${r.ref}`, ref: `${goalId}:${r.ref}` };
    return r;
  });
  const reached = rewards.find((r) => r.type === 'ziel');
  return {
    ...initialState,
    goals: g
      ? [{ id: goalId, name: g.name, targetCents: g.targetCents, dueDate: g.dueDate, createdAt: g.createdAt, reachedAt: reached?.at }]
      : [],
    primaryGoalId: g ? goalId : null,
    moments: (old.moments ?? []).map((m) => ({
      ...m,
      goalId: g && m.status === 'gesichert' && m.securedAt && new Date(m.securedAt).getTime() >= since ? goalId : undefined,
    })),
    rewards,
    settings: { ...initialState.settings, ...old.settings },
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
  let extraCents = 0;
  for (const m of state.moments) {
    const t = new Date(m.createdAt).getTime();
    first = Math.min(first, t);
    if (m.kind === 'extra') extraCents += m.amountCents;
    if (t >= weekFrom) weekCents += m.amountCents;
    if (t >= monthFrom) monthCents += m.amountCents;
    if (m.status === 'gemerkt') openCents += m.amountCents;
    else securedCents += m.amountCents;
  }
  // Hochrechnung ohne Extra-Geld: das kommt nicht jede Woche
  const all = openCents + securedCents - extraCents;
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
