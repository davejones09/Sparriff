import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SpriteImage } from '@/components/ui';
import { RIFF_ASPECT, animalImages, riffImages, shellImage, treasureImages, type Sprite } from '@/lib/images';
import {
  DAILY_REWARD_LIMIT,
  GOAL_SHELLS,
  MOMENT_SHELLS,
  SECURED_SHELLS,
  WEEKLY_SHELLS,
} from '@/lib/logic';
import { useSpar } from '@/lib/store';
import { colors, radius } from '@/lib/theme';

type Visual = 'riff' | Sprite;

interface Step {
  title: string;
  text: string;
  visual: Visual;
}

const shellSprite: Sprite = { source: shellImage, aspect: 512 / 428 };

const STEPS: Step[] = [
  {
    title: 'Willkommen im Sparriff',
    text: 'Jeder Euro, den du nicht ausgibst, lässt dein eigenes Korallenriff wachsen. Je mehr du sparst, desto bunter und lebendiger wird es.',
    visual: 'riff',
  },
  {
    title: 'Spar-Moment eintragen',
    text: `Coffee to go gespart? Tipp auf „Spar-Moment eintragen“ und wähl „Nicht gekauft“. Direkt aufs Sparkonto eingezahlt? Dann „Eingezahlt“. Jeder Spar-Moment bringt +${MOMENT_SHELLS} Muscheln.`,
    visual: animalImages.clownfisch,
  },
  {
    title: 'Erst gemerkt, dann gesichert',
    text: `Ein Verzicht ist erst gemerkt. Schiebst du das Geld wirklich aufs Sparkonto, tippst du „Ich hab's überwiesen“ – dann ist er gesichert und bringt +${SECURED_SHELLS} Muscheln.`,
    visual: animalImages.seepferdchen,
  },
  {
    title: 'Muscheln, Level und Tiere',
    text: `Mit Muscheln wächst dein Riff – von der Sandbank bis zum Barriereriff. Bei Meilensteinen ziehen neue Tiere ein. Pro Tag zählen bis zu ${DAILY_REWARD_LIMIT} Spar-Momente.`,
    visual: shellSprite,
  },
  {
    title: 'Ziel und Schatztruhe',
    text: `Leg ein Sparziel an. Schaffst du die Wochenrate, gibt's +${WEEKLY_SHELLS} Muscheln, beim Ziel +${GOAL_SHELLS}. Ein Teil des Gesparten landet in der Schatztruhe – zum Gönnen, ohne schlechtes Gewissen.`,
    visual: treasureImages.open,
  },
];

type Target = '/' | '/ziel';

export default function TutorialScreen() {
  const { width } = useWindowDimensions();
  const scroll = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [pending, setPending] = useState<Target | null>(null);
  const tutorialSeen = useSpar((s) => s.settings.tutorialSeen);
  const hasGoal = useSpar((s) => s.goal !== null);
  const updateSettings = useSpar((s) => s.updateSettings);
  const last = index === STEPS.length - 1;

  // Beim ersten Start sind die Tabs erst freigeschaltet, wenn tutorialSeen gespeichert ist.
  useEffect(() => {
    if (pending && tutorialSeen) router.replace(pending);
  }, [pending, tutorialSeen]);

  const goTo = (i: number) => {
    scroll.current?.scrollTo({ x: i * width, animated: true });
    setIndex(i);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < STEPS.length) setIndex(i);
  };

  const finish = (target: Target) => {
    if (tutorialSeen && router.canGoBack()) {
      // Aus den Einstellungen geöffnet
      router.back();
      if (target === '/ziel') router.navigate('/ziel');
      return;
    }
    updateSettings({ tutorialSeen: true });
    setPending(target);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        {!last && (
          <Pressable onPress={() => finish('/')} hitSlop={12} accessibilityRole="button">
            <Text style={styles.skip}>Überspringen</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
      >
        {STEPS.map((step) => (
          <View key={step.title} style={[styles.page, { width, height: pageHeight || undefined }]}>
            <View style={styles.inner}>
              <View style={styles.visual}>
                <StepVisual visual={step.visual} />
              </View>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.text}>{step.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {STEPS.map((step, i) => (
            <Pressable
              key={step.title}
              onPress={() => goTo(i)}
              hitSlop={8}
              accessibilityLabel={`Schritt ${i + 1}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        {last ? (
          <>
            {hasGoal ? (
              <Button title="Los geht's" onPress={() => finish('/')} />
            ) : (
              <>
                <Button title="Ziel anlegen" onPress={() => finish('/ziel')} />
                <Button title="Erstmal umschauen" variant="secondary" onPress={() => finish('/')} />
              </>
            )}
          </>
        ) : (
          <Button title="Weiter" onPress={() => goTo(index + 1)} />
        )}
      </View>
    </SafeAreaView>
  );
}

function StepVisual({ visual }: { visual: Visual }) {
  if (visual === 'riff') {
    const w = 240;
    const h = 220;
    return (
      <View style={[styles.riff, { width: w, height: h }]}>
        <Image
          source={riffImages[4]}
          style={{ position: 'absolute', left: 0, bottom: 0, width: w, height: w / RIFF_ASPECT }}
          resizeMode="cover"
        />
      </View>
    );
  }
  const height = Math.min(170, 220 / visual.aspect);
  return <SpriteImage sprite={visual} height={height} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 20 },
  skip: { color: colors.textDim, fontSize: 15, fontWeight: '600' },
  page: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  inner: { width: '100%', maxWidth: 440, alignItems: 'center', gap: 14 },
  visual: { height: 240, alignItems: 'center', justifyContent: 'center' },
  riff: { borderRadius: radius, overflow: 'hidden', backgroundColor: colors.deep },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  text: { color: colors.textDim, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  bottom: { paddingHorizontal: 20, paddingBottom: 12, gap: 10, width: '100%', maxWidth: 480, alignSelf: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceStrong },
  dotActive: { width: 22, backgroundColor: colors.sand },
});
