import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

/** Rückfrage mit Abbrechen / Bestätigen. */
export function confirm(opts: {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  Alert.alert(opts.title, opts.message, [
    { text: opts.cancelText ?? 'Abbrechen', style: 'cancel' },
    { text: opts.confirmText, style: opts.destructive ? 'destructive' : 'default', onPress: opts.onConfirm },
  ]);
}

/** Einfacher Hinweis mit OK. */
export function notify(title: string, message: string) {
  Alert.alert(title, message);
}

/** Kurzes Erfolgs-Feedback (Vibration). */
export function success() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
