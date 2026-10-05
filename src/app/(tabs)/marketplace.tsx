import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

const categories = [
  { name: 'Perlengkapan rumah', icon: 'home-outline' as const, color: '#B4D2A5' },
  { name: 'Aksesori', icon: 'necklace' as const, color: '#F2C7A7' },
  { name: 'Furnitur', icon: 'chair-rolling' as const, color: '#D2C8A1' },
  { name: 'Gaya hidup', icon: 'bottle-tonic-outline' as const, color: '#A9CFCA' },
];

const products = [
  { name: 'Pot tanaman RePlast', material: 'Plastik daur ulang', price: 'Rp 35.000', icon: 'flower-tulip-outline' as const, tone: '#E1EAD8' },
  { name: 'Tote bag anyam', material: 'Kreasi kemasan', price: 'Rp 48.000', icon: 'shopping-outline' as const, tone: '#F4E3CE' },
  { name: 'Tempat pensil warna', material: 'Botol plastik', price: 'Rp 22.000', icon: 'pencil-outline' as const, tone: '#DAE8E8' },
  { name: 'Lampu meja ReLight', material: 'Material guna ulang', price: 'Rp 89.000', icon: 'lamp-outline' as const, tone: '#ECE5CF' },
];

export default function MarketplaceScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PILIHAN YANG LEBIH BAIK</Text>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Temukan produk lokal dari material yang mendapat hidup kedua.</Text>

        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.secondaryText} />
          <Text style={styles.searchText}>Cari produk ramah lingkungan</Text>
          <MaterialCommunityIcons name="tune-variant" size={18} color={Colors.primary} />
        </View>

        <Text style={styles.sectionTitle}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((category) => (
            <View key={category.name} style={styles.category}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <MaterialCommunityIcons name={category.icon} size={22} color={Colors.forest} />
              </View>
              <Text style={styles.categoryLabel}>{category.name}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Pilihan untukmu</Text>
          <Text style={styles.soon}>SEGERA HADIR</Text>
        </View>
        <View style={styles.productGrid}>
          {products.map((product) => (
            <View key={product.name} style={styles.product}>
              <View style={[styles.productImage, { backgroundColor: product.tone }]}>
                <MaterialCommunityIcons name={product.icon} size={43} color={Colors.forest} />
                <View style={styles.recycledBadge}>
                  <MaterialCommunityIcons name="recycle" size={11} color={Colors.primary} />
                </View>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.material}>{product.material}</Text>
              <Text style={styles.price}>{product.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 125 },
  eyebrow: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 9, letterSpacing: 1.2 },
  title: { marginTop: Spacing.sm, color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 29 },
  subtitle: { marginTop: Spacing.sm, color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 11, lineHeight: 18 },
  search: { height: 50, marginTop: Spacing.xl, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.sm, backgroundColor: '#fff' },
  searchText: { flex: 1, color: '#98A49D', fontFamily: FontFamily.body, fontSize: 10 },
  sectionTitle: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 15 },
  categoryList: { gap: Spacing.lg, paddingVertical: Spacing.lg },
  category: { width: 82, alignItems: 'center', gap: 8 },
  categoryIcon: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { color: Colors.secondaryText, fontFamily: FontFamily.medium, fontSize: 8, textAlign: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md, marginBottom: Spacing.lg },
  soon: { color: Colors.orange, fontFamily: FontFamily.semiBold, fontSize: 8, letterSpacing: 0.6 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  product: { width: '48%', gap: 5, marginBottom: Spacing.sm },
  productImage: { height: 145, marginBottom: 5, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  recycledBadge: { position: 'absolute', top: 10, right: 10, width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  productName: { color: Colors.text, fontFamily: FontFamily.semiBold, fontSize: 10 },
  material: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 8 },
  price: { marginTop: 2, color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 10 },
});
