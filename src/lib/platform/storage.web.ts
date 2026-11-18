// Browser: SQLite bräuchte spezielle Server-Header, die GitHub Pages nicht setzt – daher localStorage.
import type { StateStorage } from 'zustand/middleware';

const memory = new Map<string, string>();

function store(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // z. B. privater Modus
  }
  return {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => void memory.set(k, v),
    removeItem: (k) => void memory.delete(k),
  };
}

const webStorage: StateStorage = {
  getItem: (name) => store().getItem(name),
  setItem: (name, value) => store().setItem(name, value),
  removeItem: (name) => store().removeItem(name),
};

export default webStorage;
