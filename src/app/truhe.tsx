import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button, Label, ShellIcon, SpriteImage } from '@/components/ui';
import { animalImages, treasureImages } from '@/lib/images';
import { RARITY_LABEL, animal, type Chest } from '@/lib/logic';
import { success } from '@/lib/platform/dialog';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useAnimatedNumber } from '@/lib/useAnimatedNumber';

const RARITY_COLOR = {
  start: colors.teal,
  haeufig: colors.teal,
  selten: '#B48CE0',
  'sehr-selten': colors.sand,
} as const;

/** Öffnet die nächste Truhe mit Wackeln und zeigt das Tier. */
export default function TruheScreen() {
  const { width } = useWindowDimensions();
  const allChests = useSpar((st) => st.chests);
  const chests = allChests.filter((c) => !c.openedAt);
  const openChest = useSpar((s) => s.openChest);
  const [result, setResult] = useState<Chest | null>(null);
  const [busy, setBusy] = useState(false);
  const shake = useAnimatedNumber(0);
  const reveal = useAnimatedNumber(0);

  const current = chests[0];

  const open = () => {
    if (!current || busy) return;
    setBusy(true);
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }).start(() => {
      const gain = openChest(current.id);
      setResult(gain.opened ?? null);
      reveal.setValue(0);
      Animated.spring(reveal, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
      success();
      setBusy(false);
    });
  };

  const nextChest = () => {
    setResult(null);
    reveal.setValue(0);
  };

  const rotate = shake.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: ['0deg', '-6deg', '6deg', '-8deg', '8deg', '-10deg', '10deg', '-6deg', '6deg', '-3deg', '0deg'],
  });
  const lift = shake.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, -4, -14] });
  const scale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const animalSize = Math.min(width - 64, 340);

  if (!current && !result) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stage}>
          <SpriteImage sprite={treasureImages.closed} height={120} locked />
        </View>
        <Text style={styles.text}>Gerade ist keine Truhe zu öffnen.</Text>
        <Label>Schaffst du die Wochenrate eines Ziels, gibt’s eine kleine Truhe – für ein erreichtes Ziel eine große.</Label>
        <Button title="Zurück" variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  if (result?.animal) {
    const a = animal(result.animal);
    const sprite = animalImages[result.animal];
    const h = Math.min(220, animalSize / sprite.aspect);
    const remaining = chests.length;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Label>{result.kind === 'gross' ? 'Große Truhe' : 'Kleine Truhe'} · {result.reason}</Label>
        <View style={styles.stage}>
          <View style={[styles.glow, { backgroundColor: RARITY_COLOR[a.rarity] }]} />
          <Animated.View style={{ opacity: reveal, transform: [{ scale }] }}>
            <Image source={sprite.source} style={{ width: h * sprite.aspect, height: h }} resizeMode="contain" />
          </Animated.View>
        </View>
        <Text style={[styles.rarity, { color: RARITY_COLOR[a.rarity] }]}>{RARITY_LABEL[a.rarity]}</Text>
        <Text style={styles.title}>{a.name}</Text>
        {result.duplicate ? (
          <View style={[styles.row, { alignSelf: 'center' }]}>
            <Text style={styles.text}>Den hast du schon – dafür gibt’s</Text>
            <ShellIcon size={18} />
            <Text style={[styles.text, { color: colors.sand, fontWeight: '700' }]}>+{result.shells}</Text>
          </View>
        ) : (
          <Text style={styles.text}>Neu in deinem Riff!</Text>
        )}
        {remaining > 0 ? (
          <Button title={`Nächste Truhe öffnen (${remaining})`} onPress={nextChest} />
        ) : (
          <Button title="Ins Riff" onPress={() => router.back()} />
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Label>
        {current.kind === 'gross' ? 'Große Truhe – garantiert ein seltenes Tier' : 'Kleine Truhe'} · {current.reason}
      </Label>
      <View style={styles.stage}>
        <Animated.View style={{ transform: [{ translateY: lift }, { rotate }] }}>
          <SpriteImage sprite={treasureImages.closed} height={current.kind === 'gross' ? 190 : 150} />
        </Animated.View>
      </View>
      <Button title={busy ? 'Öffnet …' : 'Truhe öffnen'} onPress={open} disabled={busy} />
      {chests.length > 1 && <Label>Noch {chests.length - 1} weitere Truhe{chests.length > 2 ? 'n' : ''} danach.</Label>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  stage: { height: 260, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, opacity: 0.16 },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  rarity: { fontSize: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  text: { color: colors.text, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
