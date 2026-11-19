import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GoalPicker } from '@/components/GoalPicker';
import { Button, Label } from '@/components/ui';
import { DAILY_REWARD_LIMIT, dayKey, formatEuro, parseEuro, type MomentKind } from '@/lib/logic';
import { success } from '@/lib/platform/dialog';
import { playEffect } from '@/lib/sound';
import { useSpar } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

const TEMPLATES = [
  { label: 'Coffee to go', cents: 350 },
  { label: 'Lieferdienst', cents: 1800 },
  { label: 'Snack', cents: 250 },
  { label: 'Getränk unterwegs', cents: 300 },
  { label: 'Essen to go', cents: 900 },
  { label: 'Spontankauf online', cents: 2500 },
];

const EXTRA_TEMPLATES = ['Weihnachtsgeld', 'Urlaubsgeld', 'Zulage', 'Steuererstattung', 'Geldgeschenk'];

const HINT: Record<MomentKind, string> = {
  verzicht:
    'Wird als „gemerkt“ gespeichert. Sobald du das Geld wirklich zur Seite legst, sicherst du ihn für +25 Muscheln.',
  einzahlung:
    'Das Geld ist schon zur Seite gelegt (Tagesgeld, Unterkonto, ETF, Spardose …) – zählt sofort als gesichert.',
  extra:
    'Weihnachtsgeld, Zulage & Co. – zählt sofort als gesichert und bringt dich deinem Ziel schneller näher. Die Wochenrate sinkt ab nächster Woche.',
};

export default function MomentScreen() {
  const addMoment = useSpar((s) => s.addMoment);
  const addExtra = useSpar((s) => s.addExtra);
  const moments = useSpar((s) => s.moments);
  const goals = useSpar((s) => s.goals);
  const primaryGoalId = useSpar((s) => s.primaryGoalId);
  const [kind, setKind] = useState<MomentKind>('verzicht');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [goalId, setGoalId] = useState<string | null>(primaryGoalId);
  const [split, setSplit] = useState(false);
  const [parts, setParts] = useState<Record<string, string>>({});

  const today = dayKey(new Date());
  const rewardedToday = moments.filter((m) => m.rewarded && dayKey(new Date(m.createdAt)) === today).length;
  const limitReached = rewardedToday >= DAILY_REWARD_LIMIT;
  const openGoals = goals.filter((g) => !g.reachedAt);
  const total = parseEuro(amount) ?? 0;
  const assigned = Object.values(parts).reduce((a, v) => a + (parseEuro(v) ?? 0), 0);
  const rest = total - assigned;

  const switchKind = (k: MomentKind) => {
    setKind(k);
    setLabel('');
    setError(null);
  };

  const save = () => {
    const cents = parseEuro(amount);
    if (!cents) {
      setError('Bitte einen Betrag eingeben, z. B. 3,50');
      return;
    }
    if (kind === 'extra') {
      if (split) {
        if (rest !== 0) {
          setError(rest > 0 ? `Noch ${formatEuro(rest)} zu verteilen` : `${formatEuro(-rest)} zu viel verteilt`);
          return;
        }
        addExtra({
          label,
          parts: Object.entries(parts).map(([id, v]) => ({ goalId: id, amountCents: parseEuro(v) ?? 0 })),
        });
      } else {
        addExtra({ label, parts: [{ goalId, amountCents: cents }] });
      }
    } else {
      addMoment({ kind, label, amountCents: cents, goalId });
    }
    success();
    if (kind !== 'verzicht') playEffect('kasse');
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.segment}>
          <Segment active={kind === 'verzicht'} title="Nicht gekauft" onPress={() => switchKind('verzicht')} />
          <Segment active={kind === 'einzahlung'} title="Zur Seite gelegt" onPress={() => switchKind('einzahlung')} />
          <Segment active={kind === 'extra'} title="Extra-Geld" onPress={() => switchKind('extra')} />
        </View>
        <Label>{HINT[kind]}</Label>

        {kind === 'verzicht' && (
          <View style={styles.chips}>
            {TEMPLATES.map((t) => (
              <Pressable
                key={t.label}
                style={[styles.chip, label === t.label && styles.chipActive]}
                onPress={() => {
                  setLabel(t.label);
                  setAmount(formatEuro(t.cents).replace(' €', ''));
                  setError(null);
                }}
              >
                <Text style={styles.chipText}>{t.label}</Text>
                <Text style={styles.chipAmount}>{formatEuro(t.cents)}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {kind === 'extra' && (
          <View style={styles.chips}>
            {EXTRA_TEMPLATES.map((t) => (
              <Pressable key={t} style={[styles.chip, label === t && styles.chipActive]} onPress={() => setLabel(t)}>
                <Text style={styles.chipText}>{t}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Label>Betrag in €</Label>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={(v) => {
            setAmount(v);
            setError(null);
          }}
          placeholder={kind === 'extra' ? '500' : '3,50'}
          placeholderTextColor={colors.textDim}
          keyboardType="decimal-pad"
        />
        <Label>Wofür? (optional)</Label>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder={
            kind === 'verzicht' ? 'z. B. Coffee to go' : kind === 'extra' ? 'z. B. Weihnachtsgeld' : 'z. B. Spardose, Tagesgeld, ETF'
          }
          placeholderTextColor={colors.textDim}
        />

        {kind !== 'verzicht' && goals.length > 1 && !split && (
          <>
            <Label>In welches Ziel?</Label>
            <GoalPicker goals={goals} value={goalId} onChange={setGoalId} />
          </>
        )}
        {kind === 'extra' && openGoals.length > 1 && (
          <Pressable
            onPress={() => {
              setSplit(!split);
              setParts({});
              setError(null);
            }}
            hitSlop={8}
          >
            <Text style={styles.link}>{split ? 'Doch nur in ein Ziel' : 'Auf mehrere Ziele aufteilen'}</Text>
          </Pressable>
        )}
        {kind === 'extra' && split && (
          <View style={styles.split}>
            {openGoals.map((g) => (
              <View key={g.id} style={styles.splitRow}>
                <Text style={styles.splitName} numberOfLines={1}>
                  {g.name}
                </Text>
                <TextInput
                  style={[styles.input, styles.splitInput]}
                  value={parts[g.id] ?? ''}
                  onChangeText={(v) => {
                    setParts({ ...parts, [g.id]: v });
                    setError(null);
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.textDim}
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
            <Label>
              {rest === 0 ? 'Alles verteilt.' : rest > 0 ? `Noch ${formatEuro(rest)} zu verteilen` : `${formatEuro(-rest)} zu viel verteilt`}
            </Label>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
        {limitReached && (
          <Label>Heute gibt’s keine Muscheln mehr für neue Spar-Momente – gespart wird trotzdem.</Label>
        )}
        <Button title="Speichern" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Segment({ active, title, onPress }: { active: boolean; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentItem, active && styles.segmentActive]}>
      <Text style={[styles.segmentText, active && { color: colors.deep }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: colors.sand },
  segmentText: { color: colors.text, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.sand },
  chipText: { color: colors.text, fontSize: 14 },
  chipAmount: { color: colors.textDim, fontSize: 12 },
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
  link: { color: colors.sand, fontWeight: '600', fontSize: 15 },
  split: { gap: 8 },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  splitName: { flex: 1, color: colors.text, fontSize: 15 },
  splitInput: { width: 120, paddingVertical: 8 },
  error: { color: colors.coral },
});
