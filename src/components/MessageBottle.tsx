import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { bottleSprite } from '@/lib/images';
import { dayKey } from '@/lib/logic';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';
import { usePingPong } from './motion';

const WIDTH = 86;

/** Treibende Flaschenpost im Riff – Tippen öffnet den Spartipp des Tages. */
export function MessageBottle() {
  const enabled = useSpar((s) => s.settings.tips);
  const unread = useSpar((s) => s.tipRead !== dayKey(new Date()));
  const drift = usePingPong(3800);
  const glow = usePingPong(1600);
  if (!enabled) return null;

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });
  const rotate = drift.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '-6deg'] });
  const dotScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.25] });

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <Pressable onPress={() => router.push('/tipp')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Flaschenpost mit Spartipp öffnen">
        <Animated.Image
          source={bottleSprite.source}
          style={{ width: WIDTH, height: WIDTH / bottleSprite.aspect, transform: [{ translateY }, { rotate }] }}
          resizeMode="contain"
        />
        {unread && <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }] }]} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: '4%', bottom: '30%' },
  dot: {
    position: 'absolute',
    right: 2,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sand,
    borderWidth: 2,
    borderColor: colors.deep,
  },
});
