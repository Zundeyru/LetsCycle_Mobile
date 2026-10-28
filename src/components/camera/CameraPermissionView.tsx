import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface CameraPermissionViewProps {
  canAskAgain: boolean;
  onRequest(): void;
  onClose(): void;
}

export function CameraPermissionView({ canAskAgain, onRequest, onClose }: CameraPermissionViewProps) {
  // Bila pengguna sudah menolak permanen, sistem tidak akan menampilkan dialog lagi.
  const mustOpenSettings = !canAskAgain && Platform.OS !== 'web';

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <MaterialCommunityIcons name="camera-outline" size={34} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Izinkan akses kamera</Text>
      <Text style={styles.description}>
        {mustOpenSettings
          ? 'Akses kamera sebelumnya ditolak. Aktifkan lewat Pengaturan agar bisa memotret sampahmu.'
          : 'LetCycle memakai kamera untuk memotret sampah yang ingin kamu pilah atau setor.'}
      </Text>
      <View style={styles.actions}>
        {mustOpenSettings ? (
          <Button onPress={() => void Linking.openSettings()}>Buka Pengaturan</Button>
        ) : (
          <Button onPress={onRequest}>Izinkan kamera</Button>
        )}
        <Button variant="outline" onPress={onClose}>
          Nanti saja
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  title: { color: Colors.forest, fontFamily: FontFamily.heading, fontSize: 24, textAlign: 'center' },
  description: {
    maxWidth: 320,
    color: Colors.secondaryText,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: { alignSelf: 'stretch', maxWidth: 360, width: '100%', marginTop: Spacing.lg, gap: Spacing.md, alignItems: 'stretch' },
});
