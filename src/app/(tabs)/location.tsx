import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/common/Card';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

const locations = [
  { name: 'Bank Sampah Melati', address: 'Lowokwaru · 1,2 km', hours: 'Buka sampai 16.00', icon: 'recycle' as const },
  { name: 'TPS 3R Sukamaju', address: 'Klojen · 2,4 km', hours: 'Buka sampai 17.00', icon: 'warehouse' as const },
  { name: 'Setor Yuk! Dinoyo', address: 'Dinoyo · 3,1 km', hours: 'Buka sampai 15.30', icon: 'storefront-outline' as const },
];

export default function LocationScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>JELAJAHI SEKITARMU</Text>
        <Text style={styles.title}>Titik setor terdekat</Text>
        <Text style={styles.subtitle}>Pilih titik yang paling nyaman untuk setor sampahmu.</Text>

        <View style={styles.mapPlaceholder}>
          <View style={styles.roadHorizontal} />
          <View style={styles.roadVertical} />
          <View style={[styles.pin, styles.pinOne]}><MaterialCommunityIcons name="recycle" size={16} color="#fff" /></View>
          <View style={[styles.pin, styles.pinTwo]}><MaterialCommunityIcons name="map-marker" size={16} color="#fff" /></View>
          <View style={[styles.pin, styles.pinThree]}><MaterialCommunityIcons name="storefront-outline" size={16} color="#fff" /></View>
          <View style={styles.mapLabel}>
            <MaterialCommunityIcons name="crosshairs-gps" size={14} color={Colors.primary} />
            <Text style={styles.mapLabelText}>Peta titik setor</Text>
          </View>
        </View>

        <View style={styles.listHeading}>
          <Text style={styles.listTitle}>Bank sampah dan TPS</Text>
          <Text style={styles.count}>3 titik</Text>
        </View>
        <View style={styles.list}>
          {locations.map((location) => (
            <Card key={location.name} style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <MaterialCommunityIcons name={location.icon} size={21} color={Colors.primary} />
              </View>
              <View style={styles.locationCopy}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.address}>{location.address}</Text>
                <Text style={styles.hours}>{location.hours}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A39A" />
            </Card>
          ))}
        </View>
        <Text style={styles.note}>Data lokasi adalah contoh dan dapat dikembangkan dengan peta interaktif.</Text>
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
  mapPlaceholder: { height: 225, marginTop: Spacing.xl, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#E2EBDD' },
  roadHorizontal: { position: 'absolute', left: -35, top: 104, width: '125%', height: 19, borderRadius: 20, backgroundColor: '#fff', transform: [{ rotate: '-14deg' }] },
  roadVertical: { position: 'absolute', left: '54%', top: -20, width: 18, height: 280, borderRadius: 20, backgroundColor: '#fff', transform: [{ rotate: '21deg' }] },
  pin: { position: 'absolute', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderWidth: 3, borderColor: '#fff', elevation: 3 },
  pinOne: { left: '28%', top: '26%' },
  pinTwo: { left: '64%', top: '50%', backgroundColor: Colors.orange },
  pinThree: { left: '43%', top: '69%', backgroundColor: Colors.forest },
  mapLabel: { position: 'absolute', left: 13, bottom: 13, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: '#fff' },
  mapLabelText: { color: Colors.forest, fontFamily: FontFamily.medium, fontSize: 9 },
  listHeading: { marginTop: Spacing.xl, marginBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 15 },
  count: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 10 },
  list: { gap: Spacing.md },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  locationIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  locationCopy: { flex: 1, gap: 4 },
  locationName: { color: Colors.text, fontFamily: FontFamily.semiBold, fontSize: 11 },
  address: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 9 },
  hours: { color: Colors.primary, fontFamily: FontFamily.medium, fontSize: 9 },
  note: { marginTop: Spacing.lg, color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 9, lineHeight: 15 },
});
