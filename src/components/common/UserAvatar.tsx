import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { ProfileApi } from '@/lib/api/profileApi';

interface UserAvatarProps {
  size: number;
}

/** Foto profil user yang sedang login; jatuh ke inisial nama bila belum ada / gagal dimuat. */
export function UserAvatar({ size }: UserAvatarProps) {
  const { user, token } = useAuth();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const source = user ? ProfileApi.avatarSource(token, user) : null;
  const dimension = { width: size, height: size };

  if (source && failedUrl !== user?.avatarUrl) {
    return (
      <Image
        source={source}
        style={[styles.avatar, dimension]}
        contentFit="cover"
        transition={150}
        accessibilityLabel="Foto profil"
        onError={() => setFailedUrl(user?.avatarUrl ?? null)}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.fallback, dimension]}>
      <Text style={[styles.initial, { fontSize: Math.round(size * 0.42) }]}>
        {user?.name.charAt(0).toUpperCase() ?? '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: Radius.pill, backgroundColor: Colors.lime },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initial: { color: Colors.forest, fontFamily: FontFamily.semiBold },
});
