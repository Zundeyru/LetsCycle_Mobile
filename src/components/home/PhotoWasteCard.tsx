import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePhotos } from '@/hooks/usePhotos';
import { PhotosApi } from '@/lib/api/photosApi';
import { useCapturedPhoto } from '@/lib/camera/capturedPhotoStore';
import { isAuthError } from '@/shared/errors';
import type { PhotoDto } from '@/shared/types/photos';

function confirmDelete(onConfirm: () => void) {
  const message = 'Hapus foto ini dari akunmu?';
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('Hapus foto', message, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Hapus', style: 'destructive', onPress: onConfirm },
  ]);
}

export function PhotoWasteCard() {
  const { user } = useAuth();
  return user ? <AccountPhotos /> : <GuestPhoto />;
}

function AccountPhotos() {
  const { photos, token, loading, error, refresh, remove } = usePhotos();
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = (photo: PhotoDto) =>
    confirmDelete(() => {
      setDeleteError('');
      remove(photo.id).catch((removeError: unknown) =>
        setDeleteError(isAuthError(removeError) ? removeError.message : 'Gagal menghapus foto.'),
      );
    });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.text}>
          <Text style={styles.title}>Foto sampahmu</Text>
          <Text style={styles.description}>
            {photos.length > 0
              ? `${photos.length} foto tersimpan di akunmu. Tekan lama untuk menghapus.`
              : 'Potret sampah sebelum disetor; fotonya tersimpan aman di akunmu.'}
          </Text>
        </View>
        {loading && <ActivityIndicator color={Colors.primary} />}
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
          {photos.map((photo) => (
            <Pressable
              key={photo.id}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Foto ${new Date(photo.createdAt).toLocaleString('id-ID')}`}
              accessibilityHint="Tekan lama untuk menghapus"
              onLongPress={() => handleDelete(photo)}>
              <Image source={PhotosApi.imageSource(token, photo)} style={styles.thumbnail} contentFit="cover" transition={150} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {error || deleteError ? (
        <View style={styles.errorRow}>
          <Text accessibilityRole="alert" style={styles.error}>{error || deleteError}</Text>
          {error ? (
            <Pressable accessibilityRole="button" onPress={() => void refresh()}>
              <Text style={styles.link}>Coba lagi</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Button onPress={() => router.push('/camera')}>Buka kamera</Button>
    </Card>
  );
}

function GuestPhoto() {
  const photo = useCapturedPhoto();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.thumbnail} contentFit="cover" accessibilityLabel="Foto sampah terakhir" />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <MaterialCommunityIcons name="camera-outline" size={28} color={Colors.primary} />
          </View>
        )}
        <View style={styles.text}>
          <Text style={styles.title}>Foto sampahmu</Text>
          <Text style={styles.description}>
            {photo
              ? 'Foto ini hanya sementara. Masuk agar foto tersimpan di akunmu.'
              : 'Potret sampah sebelum disetor agar mudah dipilah dan dicatat.'}
          </Text>
        </View>
      </View>
      <Button onPress={() => router.push('/camera')}>{photo ? 'Foto ulang' : 'Buka kamera'}</Button>
      <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.link, styles.center]}>Masuk untuk menyimpan foto</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  gallery: { gap: Spacing.sm },
  thumbnail: { width: 72, height: 72, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: Spacing.xs },
  title: { color: Colors.forest, fontFamily: FontFamily.semiBold, fontSize: 14 },
  description: { color: Colors.secondaryText, fontFamily: FontFamily.body, fontSize: 11, lineHeight: 17 },
  errorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  error: { flex: 1, color: Colors.danger, fontFamily: FontFamily.body, fontSize: 11 },
  link: { color: Colors.primary, fontFamily: FontFamily.semiBold, fontSize: 11 },
  center: { textAlign: 'center' },
});
