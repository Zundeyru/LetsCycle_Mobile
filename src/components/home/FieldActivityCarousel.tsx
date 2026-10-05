import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/components/common/SectionHeader';
import { FontFamily, Radius, Spacing } from '@/constants/theme';

import { ForestArtwork } from './ForestArtwork';

const activities = [
  { title: 'Hari Pilah Sampah Warga', place: 'Bank Sampah Melati', icon: 'recycle' as const },
  { title: 'Aksi Bersih Kampung', place: 'Kampung Hijau', icon: 'account-group-outline' as const },
  { title: 'Setor Bareng Tetangga', place: 'Titik Setor Sukamaju', icon: 'map-marker-check-outline' as const },
];

export function FieldActivityCarousel() {
  return (
    <View>
      <SectionHeader
        title="Kegiatan lapangan"
        description="Cerita kecil dari warga yang bergerak bersama."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {activities.map((activity, index) => (
          <View key={activity.title} style={styles.card}>
            <ForestArtwork variant="activity" />
            <LinearGradient
              colors={['rgba(23,74,74,0.08)', 'rgba(18,47,43,0.78)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.activityIcon, index === 1 && styles.orangeIcon]}>
              <MaterialCommunityIcons name={activity.icon} size={24} color="#fff" />
            </View>
            <View style={styles.caption}>
              <Text style={styles.title}>{activity.title}</Text>
              <View style={styles.location}>
                <MaterialCommunityIcons name="map-marker-outline" size={12} color="#E2ECCF" />
                <Text style={styles.place}>{activity.place}</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CERITA WARGA</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md, paddingBottom: Spacing.sm },
  card: {
    width: 265,
    height: 164,
    borderRadius: Radius.md,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: '#799982',
  },
  activityIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: 'rgba(58,125,68,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeIcon: { backgroundColor: 'rgba(231,139,74,0.9)' },
  caption: { gap: 5 },
  title: { color: '#fff', fontFamily: FontFamily.semiBold, fontSize: 13 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  place: { color: '#E2ECCF', fontFamily: FontFamily.body, fontSize: 9 },
  badge: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(23,74,74,0.64)',
  },
  badgeText: { color: '#fff', fontFamily: FontFamily.medium, fontSize: 7, letterSpacing: 0.7 },
});
