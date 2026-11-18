import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSyncExternalStore } from 'react';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';
import '@/lib/reminders';

const subscribeHydration = (cb: () => void) => useSpar.persist.onFinishHydration(cb);
const isHydrated = () => useSpar.persist.hasHydrated();

export default function RootLayout() {
  // Erst rendern, wenn die gespeicherten Daten geladen sind.
  const ready = useSyncExternalStore(subscribeHydration, isHydrated);
  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.deep },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="moment" options={{ presentation: 'modal', title: 'Spar-Moment' }} />
      </Stack>
    </>
  );
}
