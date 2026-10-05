import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

const metrics = [
  { icon: 'scale-balance' as const, value: '1.240 kg', label: 'Sampah terkumpul', tone: '#E8F0E2' },
  { icon: 'account-group-outline' as const, value: '350+', label: 'Pengguna aktif', tone: '#F0F2D9' },
  { icon: 'map-marker-radius-outline' as const, value: '53 titik', label: 'Penjemputan', tone: '#E4F0EC' },
  { icon: 'cash-multiple' as const, value: 'Rp 8,2 jt', label: 'Nilai dihasilkan', tone: '#FCEBDD' },
];

export function ImpactStats() {
  return (
    <View>
      <SectionHeader
        title="Dampak yang sudah tercipta"
        description="Langkah kecil warga, perubahan nyata untuk lingkungan."
      />
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <Card key={metric.label} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: metric.tone }]}>
              <MaterialCommunityIcons name={metric.icon} size={19} color={Colors.primary} />
            </View>
            <Text style={styles.value}>{metric.value}</Text>
            <Text style={styles.label}>{metric.label}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  card: { width: '48%', minHeight: 140, justifyContent: 'center', gap: 8 },
  icon: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  value: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 20, marginTop: 3 },
  label: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 10 },
});
