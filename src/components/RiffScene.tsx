import { useState, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { RIFF_ASPECT, riffImages } from '@/lib/images';
import type { AnimalId } from '@/lib/logic';
import { colors, radius } from '@/lib/theme';
import { AnimalActor } from './AnimalActor';

/** So viele Tiere schwimmen gleichzeitig im Riff (die neuesten). */
export const MAX_IN_REEF = 8;

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
  const shown = animals.slice(-MAX_IN_REEF);

  return (
    <View style={[styles.frame, { height }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Image
        source={riffImages[levelIndex]}
        style={{ position: 'absolute', left: 0, bottom: 0, width, height: imageHeight }}
        resizeMode="cover"
      />
      {shown.map((id) => (
        <AnimalActor key={id} id={id} index={animals.indexOf(id)} frameWidth={width} frameHeight={height} />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors.deep,
  },
});
