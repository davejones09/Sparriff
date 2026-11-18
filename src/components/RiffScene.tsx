import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useAnimatedValue } from 'react-native';
import { RIFF_ASPECT, animalImages, riffImages } from '@/lib/images';
import type { AnimalId } from '@/lib/logic';
import { colors, radius } from '@/lib/theme';

/** Das Riff auf dem Startbildschirm – zeigt den unteren Teil des Hochformat-Bilds. */
export function RiffScene({
  levelIndex,
  animals,
  children,
}: {
  levelIndex: number;
  animals: AnimalId[];
  children?: ReactNode;
}) {
  const [width, setWidth] = useState(360);
  const height = Math.round(width * 1.35);
  const imageHeight = width / RIFF_ASPECT;

  return (
    <View style={[styles.frame, { height }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Image
        source={riffImages[levelIndex]}
        style={{ position: 'absolute', left: 0, bottom: 0, width, height: imageHeight }}
        resizeMode="cover"
      />

      {animals.includes('schildkroete') && (
        <Swimmer width={width} y={height * 0.1} duration={30000} delay={0} size={width * 0.3}>
          <AnimalSprite id="schildkroete" width={width * 0.3} />
        </Swimmer>
      )}
      {animals.includes('clownfisch') && (
        <Swimmer width={width} y={height * 0.42} duration={16000} delay={1500} size={width * 0.17}>
          <AnimalSprite id="clownfisch" width={width * 0.17} />
        </Swimmer>
      )}
      {animals.includes('seepferdchen') && (
        <Bobber x={width * 0.1} y={height * 0.5}>
          <AnimalSprite id="seepferdchen" width={width * 0.09} />
        </Bobber>
      )}

      {children}
    </View>
  );
}

function AnimalSprite({ id, width }: { id: AnimalId; width: number }) {
  const sprite = animalImages[id];
  return <Image source={sprite.source} style={{ width, height: width / sprite.aspect }} resizeMode="contain" />;
}

function Swimmer({
  width,
  y,
  duration,
  delay,
  size,
  children,
}: {
  width: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
  children: ReactNode;
}) {
  const t = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [t, duration, delay]);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-size, width + size] });
  return (
    <Animated.View style={{ position: 'absolute', top: y, left: 0, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
}

function Bobber({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  const t = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [t]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors.deep,
  },
});
