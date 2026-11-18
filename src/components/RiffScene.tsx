import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useAnimatedValue } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { animalImages, riffImages } from '@/lib/images';
import type { AnimalId } from '@/lib/logic';
import { colors, radius } from '@/lib/theme';

/**
 * Das Riff auf dem Startbildschirm.
 * Platzhalter-Grafik, bis die GPT-Bilder in src/lib/images.ts eingetragen sind.
 */
export function RiffScene({
  levelIndex,
  animals,
  height = 300,
  children,
}: {
  levelIndex: number;
  animals: AnimalId[];
  height?: number;
  children?: ReactNode;
}) {
  const [width, setWidth] = useState(360);
  const image = riffImages[levelIndex] ?? null;

  return (
    <View style={[styles.frame, { height }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {image ? (
        <Image source={image} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <ReefBackdrop levelIndex={levelIndex} />
      )}

      {animals.includes('schildkroete') && (
        <Swimmer width={width} y={height * 0.2} duration={26000} delay={0} size={70}>
          <AnimalSprite id="schildkroete" />
        </Swimmer>
      )}
      {animals.includes('clownfisch') && (
        <Swimmer width={width} y={height * 0.55} duration={14000} delay={1500} size={48}>
          <AnimalSprite id="clownfisch" />
        </Swimmer>
      )}
      {animals.includes('seepferdchen') && (
        <Bobber x={width * 0.14} y={height * 0.42}>
          <AnimalSprite id="seepferdchen" />
        </Bobber>
      )}

      {children}
    </View>
  );
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
        Animated.timing(t, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [t]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function AnimalSprite({ id }: { id: AnimalId }) {
  const image = animalImages[id];
  if (image) {
    const size = id === 'schildkroete' ? 72 : 48;
    return <Image source={image} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  if (id === 'clownfisch') {
    return (
      <Svg width={46} height={24} viewBox="0 0 46 24">
        <Path d="M10 12 L1 4 L3 12 L1 20 Z" fill="#C8642E" />
        <Ellipse cx="25" cy="12" rx="17" ry="9" fill="#D9733A" />
        <Path d="M19 4 Q16 12 19 20" stroke="#F1EDE6" strokeWidth="3" fill="none" />
        <Path d="M30 3.5 Q27 12 30 20.5" stroke="#F1EDE6" strokeWidth="3" fill="none" />
        <Circle cx="37" cy="10" r="1.4" fill="#1B1B1B" />
      </Svg>
    );
  }
  if (id === 'seepferdchen') {
    return (
      <Svg width={28} height={50} viewBox="0 0 28 50">
        <Path
          d="M16 6 C24 6 24 16 17 19 C11 22 19 30 15 38 C12 44 6 43 8 38"
          stroke="#C9973F"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M17 6 L25 8" stroke="#C9973F" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="18" cy="8" r="1" fill="#2A2A2A" />
      </Svg>
    );
  }
  return (
    <Svg width={70} height={40} viewBox="0 0 70 40">
      <Ellipse cx="22" cy="10" rx="9" ry="4" fill="#6F8A5C" transform="rotate(-25 22 10)" />
      <Ellipse cx="22" cy="30" rx="9" ry="4" fill="#6F8A5C" transform="rotate(25 22 30)" />
      <Ellipse cx="46" cy="9" rx="10" ry="4" fill="#6F8A5C" transform="rotate(-35 46 9)" />
      <Ellipse cx="46" cy="31" rx="10" ry="4" fill="#6F8A5C" transform="rotate(35 46 31)" />
      <Ellipse cx="34" cy="20" rx="20" ry="12" fill="#56693F" />
      <Ellipse cx="34" cy="20" rx="14" ry="8" fill="#6B7F4D" />
      <Ellipse cx="59" cy="20" rx="7" ry="5" fill="#7E9562" />
    </Svg>
  );
}

function ReefBackdrop({ levelIndex }: { levelIndex: number }) {
  const lv = levelIndex;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#167A96" />
          <Stop offset="0.55" stopColor="#0B4560" />
          <Stop offset="1" stopColor="#062A3D" />
        </LinearGradient>
        <LinearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B99B66" />
          <Stop offset="1" stopColor="#6E5B3C" />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width="360" height="300" fill="url(#water)" />
      <G opacity={0.06}>
        <Polygon points="40,0 90,0 150,300 110,300" fill="#FFFFFF" />
        <Polygon points="170,0 200,0 232,300 202,300" fill="#FFFFFF" />
        <Polygon points="262,0 300,0 330,300 292,300" fill="#FFFFFF" />
      </G>

      {lv >= 4 && (
        <G opacity={0.85}>
          <Path d="M205 246 L226 206 L334 200 L350 246 Z" fill="#0A2E40" />
          <Path d="M276 203 L270 140" stroke="#0A2E40" strokeWidth={4} />
          <Path d="M270 160 L300 166" stroke="#0A2E40" strokeWidth={2} />
          <Rect x="240" y="214" width="10" height="7" rx="2" fill="#062233" />
          <Rect x="262" y="212" width="10" height="7" rx="2" fill="#062233" />
          <Rect x="284" y="211" width="10" height="7" rx="2" fill="#062233" />
        </G>
      )}

      <Path d="M0 250 Q90 235 180 248 T360 244 V300 H0 Z" fill="url(#sand)" />
      <Ellipse cx="60" cy="258" rx="18" ry="7" fill="#3B4A4F" opacity={0.8} />
      <Ellipse cx="300" cy="256" rx="13" ry="5" fill="#3B4A4F" opacity={0.8} />

      {lv >= 1 && (
        <G stroke="#4C8A5E" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.9}>
          <Path d="M30 256 C25 222 40 202 32 172" />
          <Path d="M38 256 C45 226 30 206 42 182" />
          <Path d="M46 256 C44 236 52 222 48 204" />
          <Path d="M318 252 C312 222 328 206 320 178" />
          <Path d="M326 252 C334 226 320 210 332 190" />
        </G>
      )}

      {lv >= 2 && (
        <G>
          <G stroke={colors.coral} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M100 250 V214 M100 232 L88 218 V204 M100 225 L113 211 V197" />
            <Path d="M256 248 V220 M256 234 L246 222 V210 M256 228 L267 216 V206" />
          </G>
          <Ellipse cx="176" cy="248" rx="22" ry="11" fill="#B4875C" />
          <Path d="M160 246 Q168 240 176 246 T192 246" stroke="#8E6A47" strokeWidth={1.5} fill="none" />
        </G>
      )}

      {lv >= 3 && (
        <G>
          <G stroke="#8A5C8D" strokeWidth={3} strokeLinecap="round" fill="none">
            <Path d="M215 250 L200 204" />
            <Path d="M215 250 L208 198" />
            <Path d="M215 250 L222 198" />
            <Path d="M215 250 L231 204" />
          </G>
          <Rect x="136" y="214" width="10" height="36" rx="5" fill="#C99A47" />
          <Rect x="148" y="222" width="9" height="28" rx="4.5" fill="#B7883B" />
          <G stroke="#D98FA0" strokeWidth={2} strokeLinecap="round">
            <Path d="M70 250 L64 236" />
            <Path d="M73 250 L72 234" />
            <Path d="M76 250 L80 236" />
            <Path d="M79 250 L86 239" />
          </G>
        </G>
      )}

      <G fill="#FFFFFF" opacity={0.25}>
        <Circle cx="112" cy="180" r="2" />
        <Circle cx="116" cy="164" r="1.5" />
        <Circle cx="110" cy="148" r="1" />
        <Circle cx="262" cy="190" r="1.8" />
        <Circle cx="266" cy="172" r="1.2" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors.deep,
  },
});
