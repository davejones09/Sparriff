import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RewardToast } from '@/components/RewardToast';
import { RiffScene } from '@/components/RiffScene';
import { Button, Card, Label, ProgressBar, ShellIcon } from '@/components/ui';
import {
  formatEuro,
  goalProgress,
  isPayday,
  levelFor,
  totalShells,
  totals,
  unlockedAnimals,
} from '@/lib/logic';
import { confirm, success } from '@/lib/platform/dialog';
import { useSpar } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function RiffScreen() {
  const s = useSpar();
  const now = new Date();
  const shells = totalShells(s);
  const { level, next, progress } = levelFor(shells);
  const t = totals(s, now);
  const gp = goalProgress(s, now);
  const open = s.moments.filter((m) => m.status === 'gemerkt');
  const payday = isPayday(s.settings, now);

  const secureAll = () =>
    confirm({
      title: 'Geld gesichert?',
      message: `Hast du ${formatEuro(t.openCents)} aufs Sparkonto überwiesen?`,
      confirmText: 'Ja, überwiesen',
      cancelText: 'Noch nicht',
      onConfirm: () => {
        s.secure(open.map((m) => m.id));
        success();
      },
    });

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sparriff</Text>
          <View style={styles.chip}>
            <ShellIcon size={18} />
            <Text style={styles.chipText}>{shells}</Text>
          </View>
        </View>

        <View>
          <RiffScene levelIndex={level.index} animals={unlockedAnimals(s)}>
            <RewardToast />
          </RiffScene>
        </View>

        <Card>
          <View style={styles.between}>
            <Text style={styles.h2}>{level.name}</Text>
            <Label>Level {level.index + 1} von 5</Label>
          </View>
          <ProgressBar value={progress} color={colors.teal} />
          <Label>
            {next
              ? `Noch ${next.min - shells} Muscheln bis ${next.name}`
              : 'Dein Riff ist voll ausgebaut.'}
          </Label>
        </Card>

        {open.length > 0 && (
          <Card style={payday && { borderColor: colors.sand }}>
            <Text style={styles.h2}>{payday ? 'Heute ist Zahltag' : 'Offen zum Sichern'}</Text>
            <Text style={styles.text}>
              {formatEuro(t.openCents)} aus {open.length} Spar-Moment{open.length === 1 ? '' : 'en'} warten
              auf dein Sparkonto. Jeder gesicherte bringt +25 Muscheln.
            </Text>
            <Button title="Ich hab's überwiesen" variant="secondary" onPress={secureAll} />
          </Card>
        )}

        {s.goal && gp ? (
          <Card>
            <View style={styles.between}>
              <Text style={styles.h2}>{s.goal.name}</Text>
              <Label>{Math.round(gp.fraction * 100)} %</Label>
            </View>
            <ProgressBar value={gp.fraction} />
            <Label>
              {formatEuro(gp.securedCents)} von {formatEuro(s.goal.targetCents)} gesichert
            </Label>
          </Card>
        ) : (
          <Card>
            <Text style={styles.h2}>Leg dein Sparziel an</Text>
            <Text style={styles.text}>Mit Ziel gibt es Bonus-Muscheln für jede geschaffte Wochenrate.</Text>
            <Button title="Ziel anlegen" variant="secondary" onPress={() => router.navigate('/ziel')} />
          </Card>
        )}

        <Button title="Spar-Moment eintragen" onPress={() => router.push('/moment')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceStrong,
  },
  chipText: { color: colors.sand, fontSize: 16, fontWeight: '700' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h2: { color: colors.text, fontSize: 17, fontWeight: '600' },
  text: { color: colors.text, fontSize: 15, lineHeight: 21 },
});
