import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Label } from '@/components/ui';
import { ANIMALS, formatEuro, totals, unlockedAnimals, type SparMoment } from '@/lib/logic';
import { useSpar } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

export default function UebersichtScreen() {
  const s = useSpar();
  const t = totals(s, new Date());
  const unlocked = unlockedAnimals(s);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        <Stat label="Diese Woche" value={formatEuro(t.weekCents)} />
        <Stat label="Dieser Monat" value={formatEuro(t.monthCents)} />
        <Stat label="Offen zum Sichern" value={formatEuro(t.openCents)} />
        <Stat label="Gesichert gesamt" value={formatEuro(t.securedCents)} />
      </View>
      <Card>
        <Label>Hochrechnung aufs Jahr</Label>
        <Text style={styles.big}>{formatEuro(t.yearProjectionCents)}</Text>
        <Label>Wenn du in deinem bisherigen Tempo weitersparst.</Label>
      </Card>

      <Text style={styles.h2}>Deine Riff-Bewohner</Text>
      <Card>
        {ANIMALS.map((a) => {
          const has = unlocked.includes(a.id);
          return (
            <View key={a.id} style={[styles.between, !has && { opacity: 0.45 }]}>
              <Text style={styles.text}>{has ? a.name : '???'}</Text>
              <Label>{a.hint}</Label>
            </View>
          );
        })}
      </Card>

      <Text style={styles.h2}>Spar-Momente</Text>
      {s.moments.length === 0 && <Label>Noch nichts eingetragen.</Label>}
      {s.moments.map((m) => (
        <MomentRow key={m.id} m={m} onSecure={() => s.secure([m.id])} onDelete={() => s.deleteMoment(m.id)} />
      ))}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Label>{label}</Label>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MomentRow({ m, onSecure, onDelete }: { m: SparMoment; onSecure: () => void; onDelete: () => void }) {
  const date = new Date(m.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  const confirmDelete = () =>
    Alert.alert('Spar-Moment löschen?', `${m.label} · ${formatEuro(m.amountCents)}`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: onDelete },
    ]);

  return (
    <Pressable onLongPress={confirmDelete} style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.text}>{m.label}</Text>
        <Label>
          {date} · {m.status === 'gesichert' ? 'gesichert' : 'gemerkt'}
        </Label>
      </View>
      <Text style={styles.amount}>{formatEuro(m.amountCents)}</Text>
      {m.status === 'gemerkt' && (
        <Pressable onPress={onSecure} style={styles.secure}>
          <Text style={styles.secureText}>Sichern</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    padding: 14,
    gap: 4,
  },
  statValue: { color: colors.text, fontSize: 19, fontWeight: '700' },
  big: { color: colors.sand, fontSize: 26, fontWeight: '700' },
  h2: { color: colors.text, fontSize: 17, fontWeight: '600', marginTop: 8 },
  text: { color: colors.text, fontSize: 15 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius,
    backgroundColor: colors.surface,
  },
  amount: { color: colors.text, fontWeight: '600', fontSize: 15 },
  secure: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.sand },
  secureText: { color: colors.deep, fontWeight: '700', fontSize: 13 },
});
