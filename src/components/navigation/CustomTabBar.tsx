import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

const tabs: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  href: Href;
  route: string;
}[] = [
  { label: 'Home', icon: 'home-variant-outline', href: '/(tabs)', route: 'index' },
  { label: 'Location', icon: 'map-marker-outline', href: '/(tabs)/location', route: 'location' },
  { label: 'Marketplace', icon: 'shopping-outline', href: '/(tabs)/marketplace', route: 'marketplace' },
  { label: 'Account', icon: 'account-outline', href: '/(tabs)/account', route: 'account' },
];

export function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const activeRoute = segments[1] ?? 'index';

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { marginBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        {tabs.map((tab) => {
          const selected = activeRoute === tab.route;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              key={tab.route}
              onPress={() => router.navigate(tab.href)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <MaterialCommunityIcons
                name={selected ? activeIcon(tab.icon) : tab.icon}
                size={21}
                color={selected ? Colors.primary : '#84918A'}
              />
              <Text style={[styles.label, selected && styles.activeLabel]}>{tab.label}</Text>
              {selected && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function activeIcon(icon: keyof typeof MaterialCommunityIcons.glyphMap): keyof typeof MaterialCommunityIcons.glyphMap {
  const filledIcons: Partial<Record<typeof icon, typeof icon>> = {
    'home-variant-outline': 'home-variant',
    'map-marker-outline': 'map-marker',
    'shopping-outline': 'shopping',
    'account-outline': 'account',
  };
  return filledIcons[icon] ?? icon;
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    width: '92%',
    maxWidth: 500,
    minHeight: 66,
    paddingHorizontal: Spacing.sm,
    paddingTop: 9,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: Radius.lg,
    backgroundColor: '#fff',
    shadowColor: '#1E3C31',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
  },
  item: { minWidth: 61, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { color: '#84918A', fontFamily: FontFamily.medium, fontSize: 9 },
  activeLabel: { color: Colors.primary, fontFamily: FontFamily.semiBold },
  activeDot: { position: 'absolute', width: 4, height: 4, top: -6, borderRadius: 2, backgroundColor: Colors.lime },
  pressed: { opacity: 0.72 },
});
