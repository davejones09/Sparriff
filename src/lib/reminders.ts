import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Settings } from './logic';

const CHANNEL = 'zahltag';

export const remindersSupported = true;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Plant die monatliche Zahltag-Erinnerung neu.
 * Gibt false zurück, wenn keine Berechtigung erteilt wurde.
 */
export async function scheduleZahltag(settings: Settings): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.remindersEnabled) return true;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Zahltag-Erinnerung',
      // eslint-disable-next-line import/namespace -- Enum wird per `export *` re-exportiert
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { granted } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  if (!granted) return false;

  const content = {
    title: 'Zahltag im Riff',
    body: 'Schieb deine gemerkten Beträge aufs Sparkonto – jeder gesicherte Spar-Moment bringt +25 Muscheln.',
  };

  if (Platform.OS === 'android') {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: settings.paydayDay,
        hour: settings.reminderHour,
        minute: 0,
        channelId: CHANNEL,
      },
    });
  } else {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        day: settings.paydayDay,
        hour: settings.reminderHour,
        minute: 0,
        repeats: true,
      },
    });
  }
  return true;
}
