import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { AppStrings } from '@/constants/strings';

export function HomeFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="recycle" size={18} color={Colors.forest} />
        </View>
        <Text style={styles.brand}>{AppStrings.appName}</Text>
      </View>
      <Text style={styles.description}>
        Platform pengelolaan sampah warga untuk masa depan yang lebih baik.
      </Text>
      <View style={styles.links}>
        <View style={styles.column}>
          <Text style={styles.heading}>Jelajahi</Text>
          <Text style={styles.link}>Beranda</Text>
          <Text style={styles.link}>Titik setor</Text>
          <Text style={styles.link}>Marketplace</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.heading}>Hubungi kami</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL('mailto:hallo@letcycle.id')}
            style={styles.contact}>
            <MaterialCommunityIcons name="email-outline" size={14} color={Colors.lime} />
            <Text style={styles.link}>hallo@letcycle.id</Text>
          </Pressable>
          <View style={styles.contact}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors.lime} />
            <Text style={styles.link}>Malang, Jawa Timur</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.copyright}>© 2026 LetCycle. Hak cipta dilindungi.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: Spacing.xxl, marginHorizontal: -Spacing.xl, padding: Spacing.xl, backgroundColor: '#20383A' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.lime, alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#fff', fontFamily: FontFamily.semiBold, fontSize: 17 },
  description: { maxWidth: 280, marginTop: Spacing.md, color: '#C4D1C9', fontFamily: FontFamily.body, fontSize: 10, lineHeight: 17 },
  links: { flexDirection: 'row', gap: Spacing.section, marginTop: Spacing.xl },
  column: { flex: 1, gap: Spacing.sm },
  heading: { color: '#fff', fontFamily: FontFamily.semiBold, fontSize: 11, marginBottom: 2 },
  link: { color: '#C4D1C9', fontFamily: FontFamily.body, fontSize: 9 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: Spacing.xl },
  copyright: { marginTop: Spacing.md, color: '#9FAFA6', fontFamily: FontFamily.body, fontSize: 8, textAlign: 'center' },
});
