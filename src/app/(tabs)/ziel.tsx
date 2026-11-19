import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Label, ProgressBar, SpriteImage } from '@/components/ui';
import { treasureImages } from '@/lib/images';
import {
  dayKey,
  formatEuro,
  formatGermanDate,
  goalForecast,
  goalProgress,
  parseEuro,
  parseGermanDate,
  type Goal,
  type GoalInput,
} from '@/lib/logic';
import { confirm } from '@/lib/platform/dialog';
import { useSpar } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

type Mode = { type: 'list' } | { type: 'new' } | { type: 'edit'; goal: Goal };

export default function ZieleScreen() {
  const s = useSpar();
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const now = new Date();

  if (s.goals.length === 0 || mode.type !== 'list') {
    const editing = mode.type === 'edit' ? mode.goal : null;
    return (
      <GoalForm
        initial={editing}
        first={s.goals.length === 0}
        onCancel={s.goals.length > 0 ? () => setMode({ type: 'list' }) : undefined}
        onSave={(input) => {
          if (editing) s.updateGoal(editing.id, input);
          else s.addGoal(input);
          setMode({ type: 'list' });
        }}
      />
    );
  }

  // Hauptziel zuerst, erreichte Ziele zuletzt
  const sorted = [...s.goals].sort(
    (a, b) =>
      Number(b.id === s.primaryGoalId) - Number(a.id === s.primaryGoalId) ||
      Number(Boolean(a.reachedAt)) - Number(Boolean(b.reachedAt)),
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {sorted.map((goal) => {
        const p = goalProgress(s, goal.id, now)!;
        const forecast = goalForecast(s, goal.id, now);
        const lowered = p.weeklyRateCents < p.initialWeeklyRateCents;
        const weekDone = p.thisWeekCents >= p.weeklyRateCents;
        return (
          <Card key={goal.id} style={[p.primary && { borderColor: colors.sand }, p.reached && { opacity: 0.85 }]}>
            <View style={styles.between}>
              <Text style={styles.h1}>{goal.name}</Text>
              {p.reached ? (
                <Text style={[styles.badge, { color: colors.good }]}>{goal.early ? 'Erreicht · Frühstarter' : 'Erreicht'}</Text>
              ) : (
                p.primary && <Text style={styles.badge}>Hauptziel</Text>
              )}
            </View>
            <Text style={styles.big}>
              {formatEuro(p.securedCents)} <Text style={styles.dim}>von {formatEuro(goal.targetCents)}</Text>
            </Text>
            <ProgressBar value={p.fraction} color={p.reached ? colors.good : colors.sand} />
            {!p.reached && (
              <>
                <Label>
                  Bis {formatGermanDate(goal.dueDate)} ·{' '}
                  {lowered
                    ? `Nur noch ${formatEuro(p.weeklyRateCents)} pro Woche (statt ${formatEuro(p.initialWeeklyRateCents)})`
                    : `Wochenrate ${formatEuro(p.weeklyRateCents)}`}
                </Label>
                {forecast && (
                  <Label>
                    In deinem Tempo: {formatGermanDate(forecast.date)}
                    {forecastText(forecast.daysEarly)}
                  </Label>
                )}
                <Label>
                  Diese Woche {formatEuro(p.thisWeekCents)}
                  {weekDone ? ' – geschafft' : ` – noch ${formatEuro(p.weeklyRateCents - p.thisWeekCents)} bis zur Truhe`}
                </Label>
              </>
            )}
            <View style={styles.actions}>
              <Action label="Bearbeiten" onPress={() => setMode({ type: 'edit', goal })} />
              {!p.primary && !p.reached && <Action label="Als Hauptziel" onPress={() => s.setPrimaryGoal(goal.id)} />}
              <Action
                label="Löschen"
                danger
                onPress={() =>
                  confirm({
                    title: `„${goal.name}“ löschen?`,
                    message: 'Das gesicherte Geld bleibt gesichert, zählt dann aber für kein Ziel mehr.',
                    confirmText: 'Löschen',
                    destructive: true,
                    onConfirm: () => s.deleteGoal(goal.id),
                  })
                }
              />
            </View>
          </Card>
        );
      })}

      <Button title="Neues Ziel" onPress={() => setMode({ type: 'new' })} />

      <Card style={styles.info}>
        <SpriteImage sprite={treasureImages.open} height={64} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.h2}>Truhen</Text>
          <Text style={styles.text}>
            Wochenrate geschafft: kleine Truhe. Ziel erreicht: große Truhe mit einem seltenen Tier.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function forecastText(daysEarly: number): string {
  const weeks = Math.round(Math.abs(daysEarly) / 7);
  if (weeks === 0) return ' – genau im Plan';
  const span = weeks >= 8 ? `${Math.round(weeks / 4.3)} Monate` : `${weeks} Woche${weeks === 1 ? '' : 'n'}`;
  return daysEarly > 0 ? ` – ${span} früher` : ` – ${span} später`;
}

function Action({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button">
      <Text style={[styles.action, danger && { color: colors.coral }]}>{label}</Text>
    </Pressable>
  );
}

function GoalForm({
  initial,
  first,
  onSave,
  onCancel,
}: {
  initial: Goal | null;
  first: boolean;
  onSave: (input: GoalInput) => void;
  onCancel?: () => void;
}) {
  const inSixMonths = new Date();
  inSixMonths.setMonth(inSixMonths.getMonth() + 6);

  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? formatEuro(initial.targetCents).replace(' €', '') : '');
  const [date, setDate] = useState(formatGermanDate(initial?.dueDate ?? dayKey(inSixMonths)));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const targetCents = parseEuro(amount);
    const dueDate = parseGermanDate(date);
    if (!targetCents) return setError('Bitte einen Zielbetrag eingeben, z. B. 1.500');
    if (!dueDate) return setError('Datum bitte als TT.MM.JJJJ eingeben');
    if (dueDate <= dayKey(new Date())) return setError('Das Datum sollte in der Zukunft liegen');
    onSave({ name, targetCents, dueDate });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>{initial ? 'Ziel bearbeiten' : first ? 'Dein erstes Sparziel' : 'Neues Ziel'}</Text>
        <Label>Wofür sparst du?</Label>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="z. B. Urlaub, Kamera, Sushi essen"
          placeholderTextColor={colors.textDim}
        />
        <Label>Wie viel?</Label>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="1.500"
          placeholderTextColor={colors.textDim}
          keyboardType="decimal-pad"
        />
        <Label>Bis wann? (TT.MM.JJJJ)</Label>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="30.06.2027"
          placeholderTextColor={colors.textDim}
          keyboardType="numbers-and-punctuation"
        />
        {first && (
          <Label>Du kannst später weitere Ziele anlegen – auch kleine Belohnungen für dich als eigenes Ziel.</Label>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Speichern" onPress={submit} />
        {onCancel && <Button title="Abbrechen" variant="secondary" onPress={onCancel} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  h1: { color: colors.text, fontSize: 20, fontWeight: '700', flexShrink: 1 },
  h2: { color: colors.text, fontSize: 17, fontWeight: '600' },
  big: { color: colors.sand, fontSize: 24, fontWeight: '700' },
  dim: { color: colors.textDim, fontSize: 15, fontWeight: '400' },
  text: { color: colors.text, fontSize: 15, lineHeight: 21 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  badge: { color: colors.sand, fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 18, marginTop: 4 },
  action: { color: colors.textDim, fontSize: 14, fontWeight: '600' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 17,
  },
  error: { color: colors.coral },
});
