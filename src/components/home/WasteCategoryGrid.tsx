import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

const categories = [
  { name: 'Kertas & kardus', price: 'Rp 1.200 / kg', icon: 'newspaper-variant-outline' as const, color: '#A96F45', tint: '#F6E9DB' },
  { name: 'Plastik', price: 'Rp 2.500 / kg', icon: 'bottle-soda-outline' as const, color: '#328D91', tint: '#E0F0EC' },
  { name: 'Logam & kaleng', price: 'Rp 4.200 / kg', icon: 'archive-outline' as const, color: '#C56E55', tint: '#F8E8E1' },
  { name: 'Elektronik', price: 'Sesuai kondisi', icon: 'laptop' as const, color: '#526A85', tint: '#E7ECF3' },
];

export function WasteCategoryGrid() {
  return (
    <View>
      <SectionHeader
        title="Kategori sampah yang diterima"
        description="Harga dapat berubah sesuai kondisi dan titik setor."
      />
      <View style={styles.grid}>
        {categories.map((category) => (
          <Card key={category.name} style={styles.card}>
            <View style={[styles.icon, { backgroundColor: category.tint }]}>
              <MaterialCommunityIcons name={category.icon} size={22} color={category.color} />
            </View>
            <View>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.price}>{category.price}</Text>
            </View>
            <MaterialCommunityIcons name="arrow-up-right" size={17} color="#98A69C" />
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  card: {
    width: '48%',
    minHeight: 145,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { color: Colors.text, fontFamily: FontFamily.semiBold, fontSize: 11 },
  price: { marginTop: 5, color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 9 },
});
