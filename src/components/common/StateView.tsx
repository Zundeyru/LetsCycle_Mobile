import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import type { ProductsStatus } from '@/hooks/useFetchProducts';

type StateViewStatus = Exclude<ProductsStatus, 'success'>;
type ProgressStatus = Extract<StateViewStatus, 'loading' | 'checking' | 'retrying'>;
type ResultStatus = Exclude<StateViewStatus, ProgressStatus>;

interface StateViewProps {
  status: StateViewStatus;
  message?: string | null;
  onRetry: () => void;
}

const stateCopy: Record<
  ResultStatus,
  { icon: 'alert-circle-outline' | 'wifi-off' | 'clock-outline' | 'archive-outline'; title: string; message: string }
> = {
  error: {
    icon: 'alert-circle-outline',
    title: 'Gagal memuat data',
    message: 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
  },
  offline: {
    icon: 'wifi-off',
    title: 'Tidak ada koneksi internet',
    message: 'Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.',
  },
  timeout: {
    icon: 'clock-outline',
    title: 'Waktu permintaan habis',
    message: 'Server terlalu lama merespons.',
  },
  empty: {
    icon: 'archive-outline',
    title: 'Belum ada data',
    message: 'Data belum tersedia saat ini.',
  },
};

const progressCopy: Record<ProgressStatus, string> = {
  loading: 'Memuat data...',
  checking: 'Memeriksa koneksi internet...',
  retrying: 'Mencoba lagi...',
};

export function StateView({ status, message, onRetry }: StateViewProps) {
  if (status === 'loading' || status === 'checking' || status === 'retrying') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.title}>{progressCopy[status]}</Text>
        <Text style={styles.message}>Mohon tunggu sebentar.</Text>
      </View>
    );
  }

  const copy = stateCopy[status];
  const canRetry = status !== 'empty';

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={copy.icon} size={30} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.message}>{message || copy.message}</Text>
      {canRetry ? (
        <Button onPress={onRetry} style={styles.retryButton}>
          Coba Lagi
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 235,
    marginTop: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  iconCircle: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
  },
  title: {
    color: Colors.forest,
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  message: {
    color: Colors.secondaryText,
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    marginTop: Spacing.sm,
  },
});
