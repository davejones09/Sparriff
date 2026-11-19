import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState } from 'react-native';
import { playWhaleSong, startAmbience, stopAmbience } from '@/lib/sound';
import { useSpar } from '@/lib/store';

/** Spielt die Unterwasser-Atmosphäre, solange das Riff sichtbar ist – mit Walgesang, wenn ein Wal da ist. */
export function ReefSound({ whales }: { whales: boolean }) {
  const ambience = useSpar((s) => s.settings.ambience);

  useFocusEffect(
    useCallback(() => {
      if (!ambience) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const scheduleWhale = () => {
        if (!whales) return;
        timer = setTimeout(
          () => {
            playWhaleSong();
            scheduleWhale();
          },
          30000 + Math.random() * 45000,
        );
      };
      const start = () => {
        startAmbience();
        scheduleWhale();
      };
      const stop = () => {
        stopAmbience();
        if (timer) clearTimeout(timer);
      };
      start();
      const sub = AppState.addEventListener('change', (state) => (state === 'active' ? start() : stop()));
      return () => {
        sub.remove();
        stop();
      };
    }, [ambience, whales]),
  );

  return null;
}
