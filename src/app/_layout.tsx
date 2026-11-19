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
  const tutorialSeen = useSpar((s) => s.settings.tutorialSeen);
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
        {/* Beim ersten Start geht's erst durchs Tutorial. */}
        <Stack.Protected guard={tutorialSeen} redirectTo="/tutorial">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="moment" options={{ presentation: 'modal', title: 'Spar-Moment' }} />
          <Stack.Screen name="sichern" options={{ presentation: 'modal', title: 'Sichern' }} />
          <Stack.Screen name="truhe" options={{ presentation: 'modal', title: 'Schatztruhe' }} />
          <Stack.Screen name="tipp" options={{ presentation: 'modal', title: 'Flaschenpost' }} />
          <Stack.Screen name="briefe" options={{ title: 'Meine Flaschenpost' }} />
        </Stack.Protected>
        <Stack.Screen name="tutorial" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}
