import { Animated, Image, View } from 'react-native';
import { animalImages, type AnimalVisual } from '@/lib/images';
import type { AnimalId } from '@/lib/logic';
import { seeded, useLinearLoop, usePingPong } from './motion';

interface Props {
  id: AnimalId;
  /** Position in der Liste – bestimmt Bahn, Tempo und Startpunkt */
  index: number;
  frameWidth: number;
  frameHeight: number;
}

/** Ein Tier im Riff – bewegt sich je nach Art. */
export function AnimalActor({ id, index, frameWidth, frameHeight }: Props) {
  const visual = animalImages[id];
  const w = visual.size * frameWidth;
  const h = w / visual.aspect;
  const props = { visual, index, w, h, frameWidth, frameHeight };

  switch (visual.motion) {
    case 'schwimmen':
    case 'gleiten':
    case 'schwarm':
      return <Swimmer {...props} />;
    case 'krabbeln':
      return <Crawler {...props} />;
    case 'wippen':
      return <Bobber {...props} />;
    case 'qualle':
      return <Jelly {...props} />;
    case 'boden':
      return <Resting {...props} />;
  }
}

interface ActorProps {
  visual: AnimalVisual;
  index: number;
  w: number;
  h: number;
  frameWidth: number;
  frameHeight: number;
}

/** Schwimmt hin und her, dreht am Rand um, Wellenbahn mit leichter Neigung. */
function Swimmer({ visual, index, w, h, frameWidth, frameHeight }: ActorProps) {
  const big = visual.size > 0.3;
  const pass = (big ? 26000 : 15000) + seeded(index, 1) * 8000;
  const t = useLinearLoop(pass * 2, seeded(index, 2));
  const wave = usePingPong(2600 + seeded(index, 3) * 1800, seeded(index, 4) * 1000);
  const top = frameHeight * (0.06 + seeded(index, 5) * 0.5);

  const xMin = -w * 0.35;
  const xMax = frameWidth - w * 0.65;
  const steps = [0, 0.47, 0.53, 0.97, 1];
  const translateX = t.interpolate({ inputRange: steps, outputRange: [xMin, xMax, xMax, xMin, xMin] });
  const facing = t.interpolate({ inputRange: steps, outputRange: [1, 1, -1, -1, 1] });
  const amp = visual.motion === 'gleiten' ? 6 : 10;
  const translateY = wave.interpolate({ inputRange: [0, 1], outputRange: [-amp, amp] });
  const tilt = wave.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <Animated.View style={{ position: 'absolute', left: 0, top, transform: [{ translateX }, { translateY }, { rotate: tilt }] }}>
      <Animated.View style={{ transform: [{ scaleX: facing }] }}>
        {visual.motion === 'schwimmen' && visual.tail ? (
          <TailFish visual={visual} w={w} h={h} index={index} />
        ) : (
          <Flapper visual={visual} w={w} h={h} index={index} />
        )}
      </Animated.View>
    </Animated.View>
  );
}

/** Bild in zwei Teilen: Das Hinterteil pendelt um den Ansatz der Schwanzflosse. */
function TailFish({ visual, w, h, index }: { visual: AnimalVisual; w: number; h: number; index: number }) {
  const big = visual.size > 0.3;
  const wag = usePingPong(big ? 1400 : 700 + seeded(index, 6) * 200);
  const pivot = (visual.tail ?? 0.3) * w;
  const overlap = w * 0.05;
  const rotate = wag.interpolate({ inputRange: [0, 1], outputRange: big ? ['-5deg', '5deg'] : ['-8deg', '8deg'] });
  const scaleX = wag.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.86, 1, 0.86] });

  return (
    <View style={{ width: w, height: h }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: pivot + overlap,
          height: h,
          overflow: 'hidden',
          transformOrigin: '100% 50%',
          transform: [{ rotate }, { scaleX }],
        }}
      >
        <Image source={visual.source} style={{ width: w, height: h }} resizeMode="contain" />
      </Animated.View>
      <View style={{ position: 'absolute', left: pivot, top: 0, width: w - pivot, height: h, overflow: 'hidden' }}>
        <Image source={visual.source} style={{ position: 'absolute', left: -pivot, width: w, height: h }} resizeMode="contain" />
      </View>
    </View>
  );
}

/** Ganzes Bild mit leichtem Flügelschlag (Rochen, Schildkröte) bzw. Schwarm-Wogen. */
function Flapper({ visual, w, h, index }: { visual: AnimalVisual; w: number; h: number; index: number }) {
  const beat = usePingPong(visual.motion === 'schwarm' ? 1200 : 2000 + seeded(index, 7) * 600);
  const scaleY = beat.interpolate({ inputRange: [0, 1], outputRange: visual.motion === 'schwarm' ? [0.96, 1.02] : [0.9, 1.02] });
  return (
    <Animated.Image source={visual.source} style={{ width: w, height: h, transform: [{ scaleY }] }} resizeMode="contain" />
  );
}

/** Bewegt sich langsam am Grund entlang (Einsiedlerkrebs, Engelhai). */
function Crawler({ visual, index, w, h, frameWidth, frameHeight }: ActorProps) {
  const t = useLinearLoop(70000 + seeded(index, 1) * 20000, seeded(index, 2));
  const step = usePingPong(visual.size < 0.2 ? 500 : 2400);
  const xMin = -w * 0.2;
  const xMax = frameWidth - w * 0.8;
  const steps = [0, 0.47, 0.53, 0.97, 1];
  const translateX = t.interpolate({ inputRange: steps, outputRange: [xMin, xMax, xMax, xMin, xMin] });
  const facing = t.interpolate({ inputRange: steps, outputRange: [1, 1, -1, -1, 1] });
  const translateY = step.interpolate({ inputRange: [0, 1], outputRange: [0, visual.size < 0.2 ? -2 : -1] });
  const top = frameHeight * (0.95 - seeded(index, 5) * 0.06) - h;
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top, transform: [{ translateX }, { translateY }] }}>
      <Animated.Image
        source={visual.source}
        style={{ width: w, height: h, transform: [{ scaleX: facing }] }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

/** Bleibt an einer Stelle und wippt (Seepferdchen, Kugelfisch). */
function Bobber({ visual, index, w, h, frameWidth, frameHeight }: ActorProps) {
  const t = usePingPong(2600 + seeded(index, 3) * 1400, seeded(index, 4) * 800);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });
  const left = frameWidth * (0.06 + seeded(index, 8) * 0.8);
  const top = frameHeight * (0.35 + seeded(index, 5) * 0.3);
  return (
    <Animated.Image
      source={visual.source}
      style={{ position: 'absolute', left, top, width: w, height: h, transform: [{ translateY }, { rotate }] }}
      resizeMode="contain"
    />
  );
}

/** Steigt und sinkt langsam, pulsiert dabei. */
function Jelly({ visual, index, w, h, frameWidth, frameHeight }: ActorProps) {
  const drift = usePingPong(9000 + seeded(index, 3) * 3000);
  const pulse = usePingPong(1800);
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -frameHeight * 0.12] });
  const scaleY = pulse.interpolate({ inputRange: [0, 1], outputRange: [1.04, 0.9] });
  const scaleX = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.06] });
  const left = frameWidth * (0.1 + seeded(index, 8) * 0.7);
  const top = frameHeight * (0.2 + seeded(index, 5) * 0.2);
  return (
    <Animated.Image
      source={visual.source}
      style={{ position: 'absolute', left, top, width: w, height: h, opacity: 0.92, transform: [{ translateY }, { scaleX }, { scaleY }] }}
      resizeMode="contain"
    />
  );
}

/** Liegt am Grund und „atmet“ (Seestern, Oktopus, Muräne). */
function Resting({ visual, index, w, h, frameWidth, frameHeight }: ActorProps) {
  const t = usePingPong(3200 + seeded(index, 3) * 1600);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.03] });
  const left = frameWidth * (0.04 + seeded(index, 8) * 0.72);
  const top = frameHeight * (0.97 - seeded(index, 5) * 0.08) - h;
  return (
    <Animated.Image
      source={visual.source}
      style={{ position: 'absolute', left, top, width: w, height: h, transformOrigin: '50% 100%', transform: [{ scale }] }}
      resizeMode="contain"
    />
  );
}
