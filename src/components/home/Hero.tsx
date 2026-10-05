import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

import { ForestArtwork } from './ForestArtwork';

export function Hero() {
  const { user } = useAuth();

  return (
    <View style={styles.hero}>
      <ForestArtwork />
      <LinearGradient
        colors={['rgba(16, 49, 46, 0.22)', 'rgba(16, 49, 46, 0.72)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.eyebrow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>SIRKULAR DARI RUMAH</Text>
        </View>
        <Text style={styles.title}>Ubah Sampah{'\n'}Menjadi Uang</Text>
        <Text style={styles.description}>
          Pilah sampah dengan mudah, setor di dekatmu, dan lihat dampak baiknya tumbuh setiap hari.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(user ? '/(tabs)/location' : '/(auth)/register')}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>Mulai Dapat Uang Sekarang</Text>
        </Pressable>
        <View style={styles.proof}>
          <MaterialProof />
          <Text style={styles.proofText}>Mulai dari satu langkah kecil hari ini</Text>
        </View>
      </View>
      <View style={styles.bottomGlow} />
    </View>
  );
}

function MaterialProof() {
  return (
    <View style={styles.proofIcon}>
      <Text style={styles.proofIconText}>✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 420,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: '#426c60',
  },
  content: { alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 45 },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.lime },
  eyebrowText: { color: '#e9f1df', fontFamily: FontFamily.medium, fontSize: 9, letterSpacing: 1.1 },
  title: {
    marginTop: Spacing.xl,
    color: '#fff',
    textAlign: 'center',
    fontFamily: FontFamily.heading,
    fontSize: 38,
    lineHeight: 47,
  },
  description: {
    maxWidth: 310,
    marginTop: Spacing.md,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  cta: {
    minHeight: 50,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 12 },
  proof: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: Spacing.lg },
  proofIcon: {
    width: 17,
    height: 17,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofIconText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  proofText: { color: '#fff', fontFamily: FontFamily.medium, fontSize: 10 },
  bottomGlow: {
    position: 'absolute',
    bottom: -1,
    height: 9,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(232,240,226,0.24)',
  },
  pressed: { opacity: 0.85 },
});
