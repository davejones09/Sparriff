import { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSpar } from '@/lib/store';
import { useAnimatedNumber } from '@/lib/useAnimatedNumber';
import { colors, radius } from '@/lib/theme';
import { ShellIcon } from './ui';

/** Zeigt die letzte Belohnung kurz über dem Riff an. */
export function RewardToast() {
  const gain = useSpar((s) => s.lastGain);
  const clearGain = useSpar((s) => s.clearGain);
  const opacity = useAnimatedNumber(0);

  useEffect(() => {
    if (!gain) return;
    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && clearGain());
    return () => anim.stop();
  }, [gain, opacity, clearGain]);

  if (!gain) return null;
  const lines: string[] = [];
  if (gain.levelUp) lines.push(`Neues Level: ${gain.levelUp.name}`);
  for (const a of gain.newAnimals) lines.push(`Neu im Riff: ${a.name}`);
  if (gain.rewards.some((r) => r.type === 'wochenrate')) lines.push('Wochenrate geschafft');
  if (gain.rewards.some((r) => r.type === 'ziel')) lines.push('Ziel erreicht!');
  for (const g of gain.newBadges) lines.push(`Abzeichen: Frühstarter (${g.name})`);
  const chests = gain.newChests.length;
  if (chests > 0) lines.push(chests === 1 ? 'Neue Truhe – tippe unten zum Öffnen' : `${chests} neue Truhen – tippe unten zum Öffnen`);
  if (gain.shells === 0 && lines.length === 0) lines.push('Gespeichert – für heute gibt’s keine Muscheln mehr');

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { opacity }]}>
      <View style={styles.toast}>
      {gain.shells > 0 && (
        <View style={styles.row}>
          <ShellIcon size={20} />
          <Text style={styles.big}>+{gain.shells} Muscheln</Text>
        </View>
      )}
      {lines.map((l) => (
        <Text key={l} style={styles.line}>
          {l}
        </Text>
      ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 12, left: 12, right: 12, alignItems: 'center' },
  toast: {
    backgroundColor: 'rgba(4,28,44,0.88)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  big: { color: colors.sand, fontSize: 18, fontWeight: '700' },
  line: { color: colors.text, fontSize: 13 },
});
