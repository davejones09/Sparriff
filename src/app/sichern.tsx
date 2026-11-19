import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { GoalPicker } from '@/components/GoalPicker';
import { Button, Card, Label } from '@/components/ui';
import { formatEuro } from '@/lib/logic';
import { success } from '@/lib/platform/dialog';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';

/** Gemerkte Spar-Momente sichern – alle oder einen einzelnen (`?id=`). */
export default function SichernScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const moments = useSpar((s) => s.moments);
  const goals = useSpar((s) => s.goals);
  const primaryGoalId = useSpar((s) => s.primaryGoalId);
  const secure = useSpar((s) => s.secure);
  const [goalId, setGoalId] = useState<string | null>(primaryGoalId);

  const open = moments.filter((m) => m.status === 'gemerkt' && (!id || m.id === id));
  const total = open.reduce((a, m) => a + m.amountCents, 0);

  const done = () => {
    secure(
      open.map((m) => m.id),
      goalId,
    );
    success();
    router.back();
  };

  if (open.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>Gerade ist nichts offen – alles schon gesichert.</Text>
        <Button title="Zurück" variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.big}>{formatEuro(total)}</Text>
        <Label>
          aus {open.length} Spar-Moment{open.length === 1 ? '' : 'en'}
          {open.length <= 3 ? `: ${open.map((m) => m.label).join(', ')}` : ''}
        </Label>
      </Card>

      <Text style={styles.text}>
        Hast du das Geld wirklich zur Seite gelegt – aufs Tagesgeld, Unterkonto, in einen ETF oder die Spardose?
      </Text>

      {goals.length > 1 && (
        <>
          <Label>In welches Ziel?</Label>
          <GoalPicker goals={goals} value={goalId} onChange={setGoalId} />
        </>
      )}
      {goals.length === 1 && <Label>Zählt für dein Ziel „{goals[0].name}“.</Label>}

      <Button title="Ja, zur Seite gelegt" onPress={done} />
      <Button title="Noch nicht" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  big: { color: colors.sand, fontSize: 28, fontWeight: '700' },
  text: { color: colors.text, fontSize: 16, lineHeight: 22 },
});
