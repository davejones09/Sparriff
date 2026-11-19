import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Label } from '@/components/ui';
import {
  DAILY_REWARD_LIMIT,
  GOAL_SHELLS,
  LEVELS,
  MOMENT_SHELLS,
  SECURED_SHELLS,
  WEEKLY_SHELLS,
  type Settings,
} from '@/lib/logic';
import { confirm, notify } from '@/lib/platform/dialog';
import { cancelReminders, remindersSupported, scheduleZahltag } from '@/lib/reminders';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function EinstellungenScreen() {
  const settings = useSpar((s) => s.settings);
  const updateSettings = useSpar((s) => s.updateSettings);
  const resetAll = useSpar((s) => s.resetAll);

  const apply = async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    updateSettings(patch);
    const ok = await scheduleZahltag(next);
    if (!ok) {
      updateSettings({ remindersEnabled: false });
      notify('Keine Mitteilungen erlaubt', 'Erlaube Mitteilungen für Sparriff in den Einstellungen deines Handys.');
    }
  };

  const changeDay = (delta: number) => {
    const day = Math.min(28, Math.max(1, settings.paydayDay + delta));
    if (day !== settings.paydayDay) apply({ paydayDay: day });
  };

  const confirmReset = () =>
    confirm({
      title: 'Alles löschen?',
      message: 'Ziel, Spar-Momente und Muscheln werden gelöscht.',
      confirmText: 'Löschen',
      destructive: true,
      onConfirm: () => {
        resetAll();
        cancelReminders();
      },
    });

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.h2}>Zahltag</Text>
        <View style={styles.between}>
          <Stepper label="−" onPress={() => changeDay(-1)} />
          <Text style={styles.big}>{settings.paydayDay}. des Monats</Text>
          <Stepper label="+" onPress={() => changeDay(1)} />
        </View>
        <View style={styles.between}>
          <Text style={styles.text}>Erinnerung um {settings.reminderHour} Uhr</Text>
          <Switch
            disabled={!remindersSupported}
            value={settings.remindersEnabled && remindersSupported}
            onValueChange={(v) => apply({ remindersEnabled: v })}
            trackColor={{ true: colors.teal, false: colors.surfaceStrong }}
          />
        </View>
        <Label>
          {remindersSupported
            ? 'Am Zahltag erinnert dich die App, deine gemerkten Beträge zur Seite zu legen.'
            : 'Die Zahltag-Erinnerung gibt’s nur in der App, nicht im Browser. Der Zahltag-Hinweis im Riff funktioniert trotzdem.'}
        </Label>
      </Card>

      <Card>
        <Text style={styles.h2}>Sound</Text>
        <View style={styles.between}>
          <Text style={styles.text}>Effekte (Kasse, Wal-Ruf)</Text>
          <Switch
            value={settings.soundEffects}
            onValueChange={(v) => updateSettings({ soundEffects: v })}
            trackColor={{ true: colors.teal, false: colors.surfaceStrong }}
          />
        </View>
        <View style={styles.between}>
          <Text style={styles.text}>Unterwasser-Atmosphäre im Riff</Text>
          <Switch
            value={settings.ambience}
            onValueChange={(v) => updateSettings({ ambience: v })}
            trackColor={{ true: colors.teal, false: colors.surfaceStrong }}
          />
        </View>
        <Label>Mit Walgesang, wenn ein Wal in deinem Riff lebt. Bei Stummschaltung bleibt die App leise.</Label>
      </Card>

      <Card>
        <View style={styles.between}>
          <Text style={styles.text}>Flaschenpost mit Spartipps</Text>
          <Switch
            value={settings.tips}
            onValueChange={(v) => updateSettings({ tips: v })}
            trackColor={{ true: colors.teal, false: colors.surfaceStrong }}
          />
        </View>
        <Label>Jeden Tag ein neuer Tipp im Riff – passend zu Zahltag, Wochenende & Co.</Label>
      </Card>

      <Card>
        <Text style={styles.h2}>So gibt’s Muscheln</Text>
        <Rule text="Spar-Moment eintragen" shells={MOMENT_SHELLS} />
        <Rule text="Spar-Moment gesichert" shells={SECURED_SHELLS} />
        <Rule text="Wochenrate geschafft + kleine Truhe" shells={WEEKLY_SHELLS} />
        <Rule text="Sparziel erreicht + große Truhe" shells={GOAL_SHELLS} />
        <Rule text="Doppeltes Tier aus der Truhe" shells={30} suffix="–200" />
        <Label>Pro Tag zählen höchstens {DAILY_REWARD_LIMIT} Spar-Momente.</Label>
        <Label>Level: {LEVELS.map((l) => `${l.name} (${l.min})`).join(' · ')}</Label>
      </Card>

      <Button title="Tutorial ansehen" variant="secondary" onPress={() => router.push('/tutorial')} />
      <Button title="Alle Daten löschen" variant="danger" onPress={confirmReset} />
    </ScrollView>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.stepper} accessibilityRole="button">
      <Text style={styles.stepperText}>{label}</Text>
    </Pressable>
  );
}

function Rule({ text, shells, suffix = '' }: { text: string; shells: number; suffix?: string }) {
  return (
    <View style={styles.between}>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.shells}>
        +{shells}
        {suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  h2: { color: colors.text, fontSize: 17, fontWeight: '600' },
  big: { color: colors.text, fontSize: 20, fontWeight: '700' },
  text: { color: colors.text, fontSize: 15 },
  shells: { color: colors.sand, fontSize: 15, fontWeight: '700' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
  },
  stepperText: { color: colors.text, fontSize: 22, fontWeight: '600' },
});
