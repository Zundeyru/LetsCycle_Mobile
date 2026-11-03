import { useFocusEffect } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface ShakeOptions {
  /** Selisih gaya dari gravitasi (satuan g) yang dianggap guncangan. 1 g = diam. */
  threshold?: number;
  /** Jeda minimum antar guncangan (debounce) agar satu goyangan tidak terhitung berkali-kali. */
  cooldownMs?: number;
  /** Interval pembaruan sensor; makin kecil makin boros baterai. */
  intervalMs?: number;
}

/**
 * Mendeteksi guncangan perangkat lewat Accelerometer (expo-sensors).
 * Aktif hanya saat layar fokus, dan otomatis berhenti (unsubscribe) saat layar ditinggalkan.
 */
export function useShake(
  onShake: () => void,
  { threshold = 1.6, cooldownMs = 1500, intervalMs = 100 }: ShakeOptions = {},
) {
  const onShakeRef = useRef(onShake);
  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
      let lastShakeAt = 0;

      async function start() {
        // Web: modul Accelerometer expo-sensors tidak punya addListener (crash "addListener is not a
        // function"), dan datanya berupa sudut orientasi, bukan satuan g. Guncangan hanya untuk native.
        if (Platform.OS === 'web') return;
        // Sensor belum tentu ada (mis. emulator tanpa sensor), jadi cek dulu.
        if (!(await Accelerometer.isAvailableAsync())) return;
        // Izin runtime: native biasanya langsung granted, tetapi tetap diminta sesuai alurnya.
        const { granted } = await Accelerometer.requestPermissionsAsync();
        if (!granted || cancelled) return;

        Accelerometer.setUpdateInterval(intervalMs);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          // Besar percepatan total; saat diam nilainya sekitar 1 g (gravitasi).
          const force = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
          const now = Date.now();
          if (force > threshold && now - lastShakeAt > cooldownMs) {
            lastShakeAt = now;
            onShakeRef.current();
          }
        });
      }

      // Fitur tambahan: bila sensor gagal dipasang, cukup nonaktif tanpa membuat aplikasi crash.
      start().catch((error: unknown) => console.warn('Deteksi guncangan tidak tersedia:', error));
      return () => {
        cancelled = true;
        subscription?.remove();
      };
    }, [cooldownMs, intervalMs, threshold]),
  );
}
