import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Goal } from '@/lib/logic';
import { colors, radius } from '@/lib/theme';

/** Auswahl, in welches Ziel das Geld geht. Erreichte Ziele stehen hinten. */
export function GoalPicker({
  goals,
  value,
  onChange,
}: {
  goals: Goal[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const sorted = [...goals].sort((a, b) => Number(Boolean(a.reachedAt)) - Number(Boolean(b.reachedAt)));
  return (
    <View style={styles.row}>
      {sorted.map((g) => {
        const active = g.id === value;
        return (
          <Pressable
            key={g.id}
            onPress={() => onChange(g.id)}
            style={[styles.pill, active && styles.active]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && { color: colors.deep }]}>
              {g.name}
              {g.reachedAt ? ' ✓' : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.sand, borderColor: colors.sand },
  text: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
