import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

export function CtaBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.leafOne}>
        <MaterialCommunityIcons name="leaf" size={27} color="rgba(255,255,255,0.2)" />
      </View>
      <View style={styles.leafTwo}>
        <MaterialCommunityIcons name="leaf" size={18} color="rgba(255,255,255,0.19)" />
      </View>
      <Text style={styles.kicker}>MULAI DARI LINGKUNGANMU</Text>
      <Text style={styles.title}>Lingkungan bersih{'\n'}dimulai dari rumahmu</Text>
      <Text style={styles.description}>
        Ajak tetangga memilah sampah dan tumbuhkan manfaat bersama.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(auth)/register')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>Gabung Sebagai Mitra</Text>
        <MaterialCommunityIcons name="arrow-right" size={17} color={Colors.orange} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.section,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.orange,
  },
  leafOne: { position: 'absolute', right: 18, top: 18, transform: [{ rotate: '-35deg' }] },
  leafTwo: { position: 'absolute', left: 17, bottom: 20, transform: [{ rotate: '35deg' }] },
  kicker: { color: '#FFEBD7', fontFamily: FontFamily.semiBold, fontSize: 9, letterSpacing: 1.2 },
  title: {
    marginTop: Spacing.md,
    color: '#fff',
    fontFamily: FontFamily.heading,
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
  },
  description: {
    maxWidth: 270,
    marginTop: Spacing.sm,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
  },
  button: {
    minHeight: 47,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: Colors.surface,
  },
  buttonText: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 11 },
  pressed: { opacity: 0.82 },
});
