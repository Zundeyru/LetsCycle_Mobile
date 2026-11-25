import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { wasteCategoryVisuals } from '@/components/deposits/wasteCategoryVisuals';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { formatRupiah, WasteCategories } from '@/shared/wasteCategories';

// Harga diambil dari daftar bersama agar sama dengan estimasi di halaman Setoran.
const categories = WasteCategories.map((category) => ({
  name: category.name,
  price: category.pricePerKg === null ? 'Sesuai kondisi' : `${formatRupiah(category.pricePerKg)} / kg`,
  ...wasteCategoryVisuals[category.id],
}));

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
