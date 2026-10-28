import Constants from 'expo-constants';
import { Platform } from 'react-native';

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * URL dasar server API.
 * - EXPO_PUBLIC_API_URL bila diset (mis. server terpisah).
 * - Web: kosong (relatif ke origin halaman, cookie sesi ikut terkirim).
 * - Native produksi: `origin` dari plugin expo-router di app.json.
 * - Native development: alamat dev server Expo.
 */
export function getApiBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return trimSlash(override);
  if (Platform.OS === 'web') return '';

  const origin = (Constants.expoConfig?.extra?.router as { origin?: unknown } | undefined)?.origin;
  if (typeof origin === 'string' && origin) return trimSlash(origin);

  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri ? `http://${trimSlash(hostUri)}` : '';
}
