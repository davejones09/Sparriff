import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { shellImage, type Sprite } from '@/lib/images';
import { colors, radius } from '@/lib/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.buttonText, variant === 'primary' && { color: colors.deep }]}>{title}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.sand }: { value: number; color?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

/** Muschel als Währungssymbol */
export function ShellIcon({ size = 18 }: { size?: number }) {
  return <Image source={shellImage} style={{ width: size, height: size }} resizeMode="contain" />;
}

/** Freigestelltes Bild in fester Höhe; gesperrt = dunkle Silhouette. */
export function SpriteImage({ sprite, height, locked }: { sprite: Sprite; height: number; locked?: boolean }) {
  return (
    <Image
      source={sprite.source}
      resizeMode="contain"
      style={[{ height, width: height * sprite.aspect }, locked && { tintColor: '#021521', opacity: 0.75 }]}
    />
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius,
    padding: 16,
    gap: 8,
  },
  button: {
    borderRadius: radius,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.sand },
  secondary: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceStrong },
  danger: { borderWidth: 1, borderColor: colors.coral },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  label: { color: colors.textDim, fontSize: 13 },
});
