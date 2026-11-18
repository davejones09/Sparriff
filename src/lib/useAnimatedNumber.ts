import { useState } from 'react';
import { Animated } from 'react-native';

/** Wie `useAnimatedValue` aus React Native – das fehlt in react-native-web. */
export function useAnimatedNumber(initial: number): Animated.Value {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}
