import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addMoment,
  deleteMoment,
  initialState,
  secureMoments,
  setGoal,
  startNewGoal,
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
  secure: (ids: string[]) => Gain;
  deleteMoment: (id: string) => void;
  saveGoal: (input: GoalInput) => void;
  newGoal: (input: GoalInput) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

export type Store = SparState & Actions;

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function pick(s: Store): SparState {
  return { goal: s.goal, moments: s.moments, rewards: s.rewards, settings: s.settings };
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
      secure: (ids) => {
        const { state, gain } = secureMoments(pick(get()), ids, new Date());
        set({ ...state, lastGain: gain });
        return gain;
      },
      deleteMoment: (id) => set(deleteMoment(pick(get()), id)),
      saveGoal: (input) => set(setGoal(pick(get()), input, new Date())),
      newGoal: (input) => set(startNewGoal(pick(get()), input, new Date())),
      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      resetAll: () => set({ ...initialState, lastGain: null }),
    }),
    {
      name: 'sparriff',
      version: 1,
      storage: createJSONStorage(() => Storage),
      partialize: (s) => pick(s),
    },
  ),
);
