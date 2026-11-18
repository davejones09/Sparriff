import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Label, ProgressBar } from '@/components/ui';
import {
  dayKey,
  formatEuro,
  formatGermanDate,
  goalProgress,
  parseEuro,
  parseGermanDate,
  type GoalInput,
} from '@/lib/logic';
import { useSpar } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

const TREASURE_OPTIONS = [0, 5, 10, 15, 20];

type Mode = 'view' | 'edit' | 'new';

export default function ZielScreen() {
  const s = useSpar();
  const [mode, setMode] = useState<Mode>('view');
  const gp = goalProgress(s, new Date());

  if (!s.goal || mode !== 'view') {
    return (
      <GoalForm
        initial={mode === 'edit' && s.goal ? s.goal : null}
        onCancel={s.goal ? () => setMode('view') : undefined}
        onSave={(input) => {
          if (s.goal && mode === 'new') s.newGoal(input);
          else s.saveGoal(input);
          setMode('view');
        }}
      />
    );
  }

  const goal = s.goal;
  const p = gp!;
  const weekDone = p.thisWeekCents >= p.weeklyRateCents;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.h1}>{goal.name}</Text>
        <Text style={styles.big}>
          {formatEuro(p.securedCents)} <Text style={styles.dim}>von {formatEuro(goal.targetCents)}</Text>
        </Text>
        <ProgressBar value={p.fraction} />
        <Label>
          Bis {formatGermanDate(goal.dueDate)} · Wochenrate {formatEuro(p.weeklyRateCents)}
        </Label>
      </Card>

      <Card style={weekDone && { borderColor: colors.good }}>
        <Text style={styles.h2}>Diese Woche</Text>
        <ProgressBar value={Math.min(1, p.thisWeekCents / p.weeklyRateCents)} color={colors.good} />
        <Label>
          {formatEuro(p.thisWeekCents)} von {formatEuro(p.weeklyRateCents)} gesichert
          {weekDone ? ' – geschafft, +50 Muscheln' : ' – bei voller Rate gibt’s +50 Muscheln'}
        </Label>
      </Card>

      <Card style={p.reached && { borderColor: colors.sand }}>
        <Text style={styles.h2}>Schatztruhe</Text>
        {p.reached ? (
          <Text style={styles.text}>
            Die Truhe ist offen: {formatEuro(p.treasureCents)} gehören dir – ohne schlechtes Gewissen.
          </Text>
        ) : (
          <Text style={styles.text}>
            {formatEuro(p.treasureCents)} liegen drin ({goal.treasurePercent} % vom Gesparten). Sie öffnet sich, wenn
            du dein Ziel erreichst.
          </Text>
        )}
      </Card>

      <Button title="Ziel bearbeiten" variant="secondary" onPress={() => setMode('edit')} />
      <Button
        title="Neues Ziel starten"
        variant={p.reached ? 'primary' : 'secondary'}
        onPress={() =>
          p.reached
            ? setMode('new')
            : Alert.alert('Neues Ziel starten?', 'Der Fortschritt für das aktuelle Ziel beginnt dann wieder bei 0.', [
                { text: 'Abbrechen', style: 'cancel' },
                { text: 'Neu starten', style: 'destructive', onPress: () => setMode('new') },
              ])
        }
      />
    </ScrollView>
  );
}

function GoalForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: GoalInput | null;
  onSave: (input: GoalInput) => void;
  onCancel?: () => void;
}) {
  const inSixMonths = new Date();
  inSixMonths.setMonth(inSixMonths.getMonth() + 6);

  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? formatEuro(initial.targetCents).replace(' €', '') : '');
  const [date, setDate] = useState(formatGermanDate(initial?.dueDate ?? dayKey(inSixMonths)));
  const [treasure, setTreasure] = useState(initial?.treasurePercent ?? 10);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const targetCents = parseEuro(amount);
    const dueDate = parseGermanDate(date);
    if (!targetCents) return setError('Bitte einen Zielbetrag eingeben, z. B. 1.500');
    if (!dueDate) return setError('Datum bitte als TT.MM.JJJJ eingeben');
    if (dueDate <= dayKey(new Date())) return setError('Das Datum sollte in der Zukunft liegen');
    onSave({ name, targetCents, dueDate, treasurePercent: treasure });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>{initial ? 'Ziel bearbeiten' : 'Dein Sparziel'}</Text>
        <Label>Wofür sparst du?</Label>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="z. B. Urlaub"
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
        <Label>Schatztruhe – dieser Anteil ist zum Gönnen reserviert</Label>
        <View style={styles.row}>
          {TREASURE_OPTIONS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setTreasure(p)}
              style={[styles.pill, treasure === p && styles.pillActive]}
            >
              <Text style={[styles.pillText, treasure === p && { color: colors.deep }]}>{p} %</Text>
            </Pressable>
          ))}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Speichern" onPress={submit} />
        {onCancel && <Button title="Abbrechen" variant="secondary" onPress={onCancel} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  h1: { color: colors.text, fontSize: 22, fontWeight: '700' },
  h2: { color: colors.text, fontSize: 17, fontWeight: '600' },
  big: { color: colors.sand, fontSize: 26, fontWeight: '700' },
  dim: { color: colors.textDim, fontSize: 16, fontWeight: '400' },
  text: { color: colors.text, fontSize: 15, lineHeight: 21 },
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
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.sand, borderColor: colors.sand },
  pillText: { color: colors.text, fontWeight: '600' },
  error: { color: colors.coral },
});
