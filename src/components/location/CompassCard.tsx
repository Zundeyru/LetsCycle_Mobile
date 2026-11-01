import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { headingToDirection, useCompass } from '@/hooks/useCompass';

const STATUS_MESSAGES = {
  checking: 'Memeriksa sensor kompas...',
  unavailable: 'Sensor kompas tidak tersedia di perangkat ini. Coba di ponsel lewat Expo Go.',
  denied: 'Izin sensor ditolak, sehingga kompas tidak dapat ditampilkan.',
} as const;

export function CompassCard() {
  const { status, heading } = useCompass();
  const direction = headingToDirection(heading);

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityLabel={status === 'ready' ? `Kompas: menghadap ${direction}, ${heading} derajat` : STATUS_MESSAGES[status]}
        style={styles.row}>
        <View style={styles.dial}>
          {/* Jarum menunjuk utara: diputar berlawanan arah dengan arah hadap perangkat. */}
          <View style={{ transform: [{ rotate: `${status === 'ready' ? -heading : 0}deg` }] }}>
            <MaterialCommunityIcons name="navigation" size={34} color={Colors.primary} />
          </View>
          <Text style={styles.north}>U</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>Kompas</Text>
          {status === 'ready' ? (
            <>
              <Text style={styles.value}>{heading}° {direction}</Text>
              <Text style={styles.hint}>Pegang ponsel mendatar agar arahnya akurat.</Text>
            </>
          ) : (
            <Text style={styles.hint}>{STATUS_MESSAGES[status]}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  dial: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  north: { position: 'absolute', top: 3, color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 12 },
  copy: { flex: 1, gap: 2 },
  label: { color: Colors.secondaryText, fontFamily: FontFamily.medium, fontSize: 12 },
  value: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 18 },
  hint: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
});
