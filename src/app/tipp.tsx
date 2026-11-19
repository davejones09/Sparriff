import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Letter } from '@/components/Letter';
import { Button, Label } from '@/components/ui';
import { tipsForToday } from '@/lib/tipLogic';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';

/** Spartipp aus der Flaschenpost. */
export default function TippScreen() {
  const [list] = useState(() => tipsForToday(useSpar.getState(), new Date()));
  const [index, setIndex] = useState(0);
  const saved = useSpar((s) => s.savedTips);
  const saveTip = useSpar((s) => s.saveTip);
  const markTipRead = useSpar((s) => s.markTipRead);

  useEffect(() => {
    markTipRead();
  }, [markTipRead]);

  const tip = list[index % list.length];
  const isSaved = saved.includes(tip.id);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Label>{index === 0 ? 'Dein Spartipp für heute' : `Tipp ${index + 1} für heute`}</Label>
      <Letter text={tip.text} style={{ minHeight: 320 }} />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Button
            title={isSaved ? 'Aufgehoben ✓' : 'Aufheben'}
            onPress={() => saveTip(tip.id)}
            disabled={isSaved}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Noch einer" variant="secondary" onPress={() => setIndex(index + 1)} />
        </View>
      </View>
      {saved.length > 0 && (
        <Text style={styles.link} onPress={() => router.replace('/briefe')}>
          Meine Flaschenpost ansehen ({saved.length})
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 10 },
  link: { color: colors.sand, fontWeight: '600', fontSize: 15, textAlign: 'center' },
});
