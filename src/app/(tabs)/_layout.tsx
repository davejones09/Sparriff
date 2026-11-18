import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors } from '@/lib/theme';

type IconProps = { color: ColorValue; size: number };

function TabIcon({ name, color, size }: IconProps & { name: keyof typeof Ionicons.glyphMap }) {
  return <Ionicons name={name} color={typeof color === 'string' ? color : colors.textDim} size={size} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.deep },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.deep, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.sand,
        tabBarInactiveTintColor: colors.textDim,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Riff',
          headerShown: false,
          tabBarIcon: (p: IconProps) => <TabIcon name="water" {...p} />,
        }}
      />
      <Tabs.Screen
        name="ziel"
        options={{ title: 'Ziel', tabBarIcon: (p: IconProps) => <TabIcon name="flag" {...p} /> }}
      />
      <Tabs.Screen
        name="uebersicht"
        options={{ title: 'Übersicht', tabBarIcon: (p: IconProps) => <TabIcon name="stats-chart" {...p} /> }}
      />
      <Tabs.Screen
        name="einstellungen"
        options={{
          title: 'Einstellungen',
          tabBarIcon: (p: IconProps) => <TabIcon name="settings-outline" {...p} />,
        }}
      />
    </Tabs>
  );
}
