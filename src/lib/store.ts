import Storage from './platform/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addExtra,
  addGoal,
  addMoment,
  dayKey,
  deleteGoal,
  deleteMoment,
  initialState,
  migrateFromV1,
  openChest,
  secureMoments,
  setPrimaryGoal,
  updateGoal,
  type ExtraInput,
  type Gain,
  type GoalInput,
  type MomentInput,
  type Settings,
  type SparState,
} from './logic';

interface Actions {
  /** Letzte Belohnung – zeigt der Riff-Screen als Hinweis an. */
  lastGain: Gain | null;
  clearGain: () => void;
  addMoment: (input: MomentInput) => Gain;
  addExtra: (input: ExtraInput) => Gain;
  secure: (ids: string[], goalId?: string | null) => Gain;
  deleteMoment: (id: string) => void;
  addGoal: (input: GoalInput) => string;
  updateGoal: (id: string, input: GoalInput) => void;
  deleteGoal: (id: string) => void;
  setPrimaryGoal: (id: string) => void;
  /** Öffnet eine Truhe – das Ergebnis zeigt der Truhen-Screen selbst an. */
  openChest: (id: string) => Gain;
  /** Flaschenpost heute geöffnet */
  markTipRead: () => void;
  saveTip: (id: number) => void;
  removeTip: (id: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

export type Store = SparState & Actions;

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function pick(s: Store): SparState {
  return {
    goals: s.goals,
    primaryGoalId: s.primaryGoalId,
    moments: s.moments,
    rewards: s.rewards,
    chests: s.chests,
    collection: s.collection,
    savedTips: s.savedTips,
    tipRead: s.tipRead,
    settings: s.settings,
  };
}

export const useSpar = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      lastGain: null,
      clearGain: () => set({ lastGain: null }),
      addMoment: (input) => {
        const { state, gain } = addMoment(pick(get()), input, new Date(), newId());
        set({ ...state, lastGain: gain });
        return gain;
      },
      addExtra: (input) => {
        const { state, gain } = addExtra(pick(get()), input, new Date(), newId());
        set({ ...state, lastGain: gain });
        return gain;
      },
      secure: (ids, goalId) => {
        const { state, gain } = secureMoments(pick(get()), ids, goalId, new Date());
        set({ ...state, lastGain: gain });
        return gain;
      },
      deleteMoment: (id) => set(deleteMoment(pick(get()), id)),
      addGoal: (input) => {
        const id = newId();
        set(addGoal(pick(get()), input, new Date(), id));
        return id;
      },
      updateGoal: (id, input) => set(updateGoal(pick(get()), id, input)),
      deleteGoal: (id) => set(deleteGoal(pick(get()), id)),
      setPrimaryGoal: (id) => set(setPrimaryGoal(pick(get()), id)),
      openChest: (id) => {
        const { state, gain } = openChest(pick(get()), id, new Date());
        set(state);
        return gain;
      },
      markTipRead: () => set({ tipRead: dayKey(new Date()) }),
      saveTip: (id) => set({ savedTips: [id, ...get().savedTips.filter((t) => t !== id)] }),
      removeTip: (id) => set({ savedTips: get().savedTips.filter((t) => t !== id) }),
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      resetAll: () => set({ ...initialState, lastGain: null }),
    }),
    {
      name: 'sparriff',
      version: 2,
      storage: createJSONStorage(() => Storage),
      partialize: (s) => pick(s),
      // Version 1 hatte genau ein Ziel und keine Truhen.
      migrate: (persisted, version) =>
        (version < 2 ? migrateFromV1((persisted ?? {}) as Parameters<typeof migrateFromV1>[0]) : persisted) as SparState,
      // Neue Felder bekommen bei älteren Daten ihren Standardwert.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SparState>;
        return { ...current, ...saved, settings: { ...current.settings, ...saved.settings } };
      },
    },
  ),
);
