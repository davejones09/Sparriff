// Browser: keine Zahltag-Mitteilungen – die gibt's nur in der App.
import type { Settings } from './logic';

export const remindersSupported = false;

export async function scheduleZahltag(settings: Settings): Promise<boolean> {
  return !settings.remindersEnabled;
}

export async function cancelReminders(): Promise<void> {}
