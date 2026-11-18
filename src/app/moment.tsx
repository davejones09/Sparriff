import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Label } from '@/components/ui';
import { DAILY_REWARD_LIMIT, dayKey, formatEuro, parseEuro, type MomentKind } from '@/lib/logic';
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

export default function MomentScreen() {
  const addMoment = useSpar((s) => s.addMoment);
  const moments = useSpar((s) => s.moments);
  const [kind, setKind] = useState<MomentKind>('verzicht');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const today = dayKey(new Date());
  const rewardedToday = moments.filter((m) => m.rewarded && dayKey(new Date(m.createdAt)) === today).length;
  const limitReached = rewardedToday >= DAILY_REWARD_LIMIT;

  const save = () => {
    const cents = parseEuro(amount);
    if (!cents) {
      setError('Bitte einen Betrag eingeben, z. B. 3,50');
      return;
    }
    addMoment({ kind, label, amountCents: cents });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.segment}>
          <Segment active={kind === 'verzicht'} title="Nicht gekauft" onPress={() => setKind('verzicht')} />
          <Segment active={kind === 'einzahlung'} title="Eingezahlt" onPress={() => setKind('einzahlung')} />
        </View>
        <Label>
          {kind === 'verzicht'
            ? 'Wird als „gemerkt“ gespeichert. Sobald du das Geld aufs Sparkonto schiebst, sicherst du ihn für +25 Muscheln.'
            : 'Das Geld liegt schon auf dem Sparkonto – zählt sofort als gesichert.'}
        </Label>

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

        <Label>Betrag in €</Label>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={(v) => {
            setAmount(v);
            setError(null);
          }}
          placeholder="3,50"
          placeholderTextColor={colors.textDim}
          keyboardType="decimal-pad"
        />
        <Label>Wofür? (optional)</Label>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder={kind === 'verzicht' ? 'z. B. Coffee to go' : 'z. B. Sparrate November'}
          placeholderTextColor={colors.textDim}
        />
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
      <Text style={[styles.segmentText, active && { color: colors.deep }]}>{title}</Text>
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
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: radius - 4, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.sand },
  segmentText: { color: colors.text, fontWeight: '600', fontSize: 15 },
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
  error: { color: colors.coral },
});
