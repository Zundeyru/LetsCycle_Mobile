import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

export function WhyItMatters() {
  return (
    <View style={styles.card}>
      <View style={styles.topLine}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="leaf" size={20} color={Colors.forest} />
        </View>
        <Text style={styles.kicker}>KENAPA INI PENTING</Text>
      </View>
      <Text style={styles.title}>Bumi yang lebih baik dimulai dari kebiasaan kita.</Text>
      <Text style={styles.description}>
        Indonesia menghasilkan jutaan ton sampah setiap tahun. Dengan memilah dan menyetorkan
        sampah, kita menjaga lingkungan tetap bersih sekaligus memberi nilai pada barang yang
        sebelumnya terbuang.
      </Text>
      <View style={styles.foot}>
        <View style={styles.footLine} />
        <Text style={styles.footText}>Satu setoranmu berarti.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.forest,
    overflow: 'hidden',
  },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { color: '#D2E2B2', fontFamily: FontFamily.semiBold, fontSize: 10, letterSpacing: 1 },
  title: {
    marginTop: Spacing.lg,
    color: Colors.surface,
    fontFamily: FontFamily.heading,
    fontSize: 23,
    lineHeight: 31,
  },
  description: {
    marginTop: Spacing.md,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 19,
  },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: Spacing.xl },
  footLine: { width: 25, height: 2, backgroundColor: Colors.lime },
  footText: { color: Colors.lime, fontFamily: FontFamily.medium, fontSize: 10 },
});
