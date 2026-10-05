import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/components/common/SectionHeader';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

const features = [
  {
    icon: 'map-marker-radius-outline' as const,
    title: 'Titik Setor Terdekat',
    description: 'Temukan bank sampah dan jadwal jemput di sekitarmu.',
    tone: '#E8F0E2',
  },
  {
    icon: 'scale' as const,
    title: 'Timbangan Tercatat Digital',
    description: 'Setiap setoran tercatat otomatis, tanpa takaran yang terlewat.',
    tone: '#EEF1D9',
  },
  {
    icon: 'wallet-outline' as const,
    title: 'Saldo Langsung Cair',
    description: 'Tukar sampah jadi uang, praktis, aman, dan transparan.',
    tone: '#E3F0ED',
  },
];

export function FeatureList() {
  return (
    <View>
      <SectionHeader
        title="Kebiasaan yang lebih baik, lebih mudah"
        description="Semua yang kamu butuhkan untuk mulai mengelola sampah."
      />
      <View style={styles.list}>
        {features.map((feature, index) => (
          <View key={feature.title} style={styles.feature}>
            <View style={[styles.icon, { backgroundColor: feature.tone }]}>
              <MaterialCommunityIcons name={feature.icon} size={21} color={Colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{feature.title}</Text>
              <Text style={styles.description}>{feature.description}</Text>
            </View>
            <Text style={styles.number}>0{index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.lg },
  feature: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: {
    width: 47,
    height: 47,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  title: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 13 },
  description: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 10, lineHeight: 16 },
  number: { color: '#A6B7A4', fontFamily: FontFamily.medium, fontSize: 10 },
});
