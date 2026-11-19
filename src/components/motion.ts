import { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { useAnimatedNumber } from '@/lib/useAnimatedNumber';

/** Fester Zufallswert 0–1 je Tier, damit jedes anders schwimmt – aber immer gleich. */
export function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Läuft 0 → 1 und springt zurück; startet bei `phase`. */
export function useLinearLoop(duration: number, phase = 0): Animated.Value {
  const t = useAnimatedNumber(phase);
  useEffect(() => {
    let stopped = false;
    t.setValue(phase);
    const first = Animated.timing(t, {
      toValue: 1,
      duration: Math.max(1, duration * (1 - phase)),
      easing: Easing.linear,
      useNativeDriver: true,
    });
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(t, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    first.start(({ finished }) => {
      if (finished && !stopped) loop.start();
    });
    return () => {
      stopped = true;
      first.stop();
      loop.stop();
    };
  }, [t, duration, phase]);
  return t;
}

/** Pendelt weich 0 → 1 → 0. */
export function usePingPong(duration: number, delay = 0): Animated.Value {
  const t = useAnimatedNumber(0);
  useEffect(() => {
    const half = duration / 2;
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(t, { toValue: 1, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(t, { toValue: 0, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [t, duration, delay]);
  return t;
}
