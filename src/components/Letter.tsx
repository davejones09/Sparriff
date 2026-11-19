import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { paperImage } from '@/lib/images';

export const letterFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });
export const ink = '#3B2A1A';

/** Ein Tipp auf altem Briefpapier – das Papier passt sich der Textlänge an. */
export function Letter({ text, children, style }: { text: string; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.paper, style]}>
      <Image source={paperImage} resizeMode="stretch" style={styles.image} />
      <View style={styles.inner}>
        <Text style={styles.text}>{text}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { width: '100%', position: 'relative' },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: '12%', paddingTop: 48, paddingBottom: 40, gap: 16 },
  text: { fontFamily: letterFont, fontStyle: 'italic', fontSize: 19, lineHeight: 28, color: ink },
});
