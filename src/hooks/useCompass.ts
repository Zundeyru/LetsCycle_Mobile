import { useFocusEffect } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import { useCallback, useState } from 'react';

export type CompassStatus = 'checking' | 'unavailable' | 'denied' | 'ready';

const UPDATE_INTERVAL_MS = 100;
/** Low-pass filter: 0 < ALPHA <= 1. Makin kecil makin halus tetapi makin lambat bereaksi. */
const ALPHA = 0.2;

/**
 * Arah hadap perangkat (derajat, 0 = utara) dari Magnetometer.
 * Asumsi: ponsel dipegang mendatar; tidak ada kompensasi kemiringan.
 */
export function useCompass() {
  const [status, setStatus] = useState<CompassStatus>('checking');
  const [heading, setHeading] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let subscription: ReturnType<typeof Magnetometer.addListener> | null = null;
      // Nilai tersaring disimpan per komponen x/y (bukan sudut) agar tidak bermasalah di batas 359° -> 0°.
      let filteredX = 0;
      let filteredY = 0;
      let hasFirstSample = false;

      async function start() {
        if (!(await Magnetometer.isAvailableAsync())) {
          if (!cancelled) setStatus('unavailable');
          return;
        }
        const { granted } = await Magnetometer.requestPermissionsAsync();
        if (cancelled) return;
        if (!granted) {
          setStatus('denied');
          return;
        }

        setStatus('ready');
        Magnetometer.setUpdateInterval(UPDATE_INTERVAL_MS);
        subscription = Magnetometer.addListener(({ x, y }) => {
          if (!hasFirstSample) {
            filteredX = x;
            filteredY = y;
            hasFirstSample = true;
          } else {
            filteredX += ALPHA * (x - filteredX);
            filteredY += ALPHA * (y - filteredY);
          }
          const angle = (Math.atan2(filteredY, filteredX) * 180) / Math.PI;
          setHeading(Math.round((angle - 90 + 360) % 360));
        });
      }

      void start();
      return () => {
        cancelled = true;
        subscription?.remove();
      };
    }, []),
  );

  return { status, heading };
}

const DIRECTIONS = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];

export function headingToDirection(heading: number): string {
  return DIRECTIONS[Math.round(heading / 45) % 8];
}
