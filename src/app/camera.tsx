import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraCapturedPicture, CameraType, FlashMode } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPermissionView } from '@/components/camera/CameraPermissionView';
import { Button } from '@/components/common/Button';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { PhotosApi } from '@/lib/api/photosApi';
import { CapturedPhotoStore } from '@/lib/camera/capturedPhotoStore';
import { TokenStorage } from '@/lib/storage/tokenStorage';
import { isAuthError } from '@/shared/errors';

const flashCycle: FlashMode[] = ['off', 'auto', 'on'];
const flashIcons: Record<FlashMode, keyof typeof MaterialCommunityIcons.glyphMap> = {
  off: 'flash-off',
  auto: 'flash-auto',
  on: 'flash',
  screen: 'flash',
};

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <CameraPermissionView
        canAskAgain={permission.canAskAgain}
        onRequest={() => void requestPermission()}
        onClose={close}
      />
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || !isReady || isCapturing) return;
    setError('');
    setIsCapturing(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPhoto(picture);
    } catch {
      setError('Gagal mengambil foto. Coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUsePhoto = async () => {
    if (!photo || isUploading) return;

    if (!user) {
      // Tamu: foto hanya disimpan sementara di aplikasi.
      CapturedPhotoStore.set({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        takenAt: new Date().toISOString(),
      });
      close();
      return;
    }

    setError('');
    setIsUploading(true);
    try {
      await PhotosApi.upload(await TokenStorage.get(), photo.uri);
      close();
    } catch (uploadError) {
      setError(isAuthError(uploadError) ? uploadError.message : 'Gagal mengunggah foto. Coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="contain" />
        <View style={[styles.previewPanel, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <View style={styles.previewActions}>
            <Button
              variant="light"
              style={styles.previewButton}
              disabled={isUploading}
              onPress={() => {
                setError('');
                setPhoto(null);
              }}>
              Ulangi
            </Button>
            <Button style={styles.previewButton} loading={isUploading} onPress={() => void handleUsePhoto()}>
              {user ? 'Simpan ke akun' : 'Gunakan foto'}
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mode="picture"
        onCameraReady={() => setIsReady(true)}
        onMountError={({ message }) => setError(message || 'Kamera tidak dapat dibuka.')}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <IconButton icon="close" label="Tutup kamera" onPress={close} />
        {facing === 'back' && (
          <IconButton
            icon={flashIcons[flash]}
            label={`Flash: ${flash}`}
            onPress={() => setFlash(flashCycle[(flashCycle.indexOf(flash) + 1) % flashCycle.length])}
          />
        )}
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.sm }]}>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.hint}>Posisikan sampah di tengah bingkai</Text>
        <View style={styles.controls}>
          <View style={styles.sideSlot} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ambil foto"
            disabled={!isReady || isCapturing}
            onPress={() => void takePhoto()}
            style={({ pressed }) => [styles.shutter, (pressed || isCapturing) && styles.shutterPressed]}>
            {isCapturing ? <ActivityIndicator color={Colors.primary} /> : <View style={styles.shutterInner} />}
          </Pressable>
          <View style={styles.sideSlot}>
            <IconButton
              icon="camera-flip-outline"
              label="Ganti kamera"
              onPress={() => {
                setIsReady(false);
                setFacing((current) => (current === 'back' ? 'front' : 'back'));
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

interface IconButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress(): void;
}

function IconButton({ icon, label, onPress }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}>
      <MaterialCommunityIcons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  hint: { color: 'rgba(255,255,255,0.85)', fontFamily: FontFamily.medium, fontSize: 11 },
  error: {
    color: '#fff',
    fontFamily: FontFamily.medium,
    fontSize: 11,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.danger,
  },
  controls: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  sideSlot: { width: 46, alignItems: 'center' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: { opacity: 0.7 },
  shutterInner: { width: 60, height: 60, borderRadius: Radius.pill, backgroundColor: '#fff' },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iconPressed: { opacity: 0.7 },
  previewPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  previewActions: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: Spacing.md },
  previewButton: { flex: 1, maxWidth: 200 },
});
