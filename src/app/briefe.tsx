import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Letter, ink } from '@/components/Letter';
import { SpriteImage } from '@/components/ui';
import { bottleSprite } from '@/lib/images';
import { confirm } from '@/lib/platform/dialog';
import { tipById } from '@/lib/tipLogic';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';

/** Alle aufgehobenen Spartipps auf Briefpapier. */
export default function BriefeScreen() {
  const saved = useSpar((s) => s.savedTips);
  const removeTip = useSpar((s) => s.removeTip);

  if (saved.length === 0) {
    return (
      <View style={styles.empty}>
        <SpriteImage sprite={bottleSprite} height={90} />
        <Text style={styles.emptyText}>
          Noch keine Briefe. Tipp im Riff auf die Flaschenpost und heb dir gute Tipps auf.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {saved.map((id) => {
        const tip = tipById(id);
        if (!tip) return null;
        return (
          <Letter key={id} text={tip.text}>
            <Text
              style={styles.remove}
              onPress={() =>
                confirm({
                  title: 'Tipp wegwerfen?',
                  message: tip.text,
                  confirmText: 'Wegwerfen',
                  destructive: true,
                  onConfirm: () => removeTip(id),
                })
              }
            >
              Wegwerfen
            </Text>
          </Letter>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  remove: { color: ink, opacity: 0.6, fontSize: 14, fontWeight: '600', alignSelf: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emptyText: { color: colors.textDim, fontSize: 16, lineHeight: 22, textAlign: 'center' },
});
