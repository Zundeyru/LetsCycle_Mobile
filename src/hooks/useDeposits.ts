import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { DepositsApi } from '@/lib/api/depositsApi';
import { isAuthError } from '@/shared/errors';
import type { CreateDepositRequest, DepositDto } from '@/shared/types/deposits';
import { DepositValidator } from '@/shared/validators/depositValidator';

export type DepositsStatus = 'loading' | 'success' | 'error';

function messageOf(error: unknown): string {
  return isAuthError(error) ? error.message : 'Terjadi kesalahan. Silakan coba lagi.';
}

/** Alert.alert tidak berfungsi di web, jadi pakai window.alert di sana. */
function showErrorAlert(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
}

/**
 * Catatan setoran sampah milik user yang login, lewat REST API LetsCycle (GET, POST, PATCH).
 * Semua request asinkron (async/await), jadi UI tetap responsif selama menunggu server;
 * fase loading / success / error disimpan di state untuk conditional rendering.
 */
export function useDeposits() {
  const [deposits, setDeposits] = useState<DepositDto[]>([]);
  const [status, setStatus] = useState<DepositsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<ReadonlySet<string>>(new Set());
  const controllerRef = useRef<AbortController | null>(null);

  /** GET lalu simpan ke state. Hanya mengubah state setelah await. */
  const fetchInto = useCallback(async (controller: AbortController, mode: 'initial' | 'refresh') => {
    try {
      const result = await DepositsApi.list(controller.signal);
      if (controller.signal.aborted) return;
      setDeposits(result);
      setStatus('success');
    } catch (loadError) {
      if (controller.signal.aborted) return;
      setError(messageOf(loadError));
      if (mode === 'refresh') showErrorAlert('Gagal memuat ulang', messageOf(loadError));
      else setStatus('error');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRefreshing(false);
      }
    }
  }, []);

  // Pola Week 8: fungsi async dideklarasikan di dalam useEffect, dependency [] = jalan sekali saat
  // layar dibuka, dan cleanup AbortController membatalkan request bila layar ditutup sebelum selesai.
  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const fetchData = async () => {
      await fetchInto(controller, 'initial');
    };
    void fetchData();
    return () => controller.abort();
  }, [fetchInto]);

  /** Dipanggil dari tombol (Muat ulang / Coba Lagi), bukan dari effect. */
  const loadDeposits = useCallback(
    async (mode: 'initial' | 'refresh') => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (mode === 'refresh') setRefreshing(true);
      else setStatus('loading');
      setError(null);
      await fetchInto(controller, mode);
    },
    [fetchInto],
  );

  const refresh = useCallback(() => loadDeposits('refresh'), [loadDeposits]);
  const retry = useCallback(() => loadDeposits('initial'), [loadDeposits]);

  /** Mengembalikan true bila berhasil, agar layar bisa mengosongkan form. */
  const addDeposit = useCallback(async (input: Partial<CreateDepositRequest>): Promise<boolean> => {
    let body: CreateDepositRequest;
    try {
      // Validasi di client hanya untuk umpan balik cepat; server tetap memvalidasi ulang.
      body = DepositValidator.validateCreate({ ...input });
    } catch (validationError) {
      showErrorAlert('Data belum lengkap', messageOf(validationError));
      return false;
    }

    setAdding(true);
    try {
      const created = await DepositsApi.create(body);
      setDeposits((current) => [created, ...current]);
      setStatus('success');
      return true;
    } catch (addError) {
      showErrorAlert('Gagal mencatat setoran', messageOf(addError));
      return false;
    } finally {
      setAdding(false);
    }
  }, []);

  const toggleCompleted = useCallback(async (deposit: DepositDto) => {
    const nextStatus = deposit.status === 'completed' ? 'scheduled' : 'completed';
    const setLocalStatus = (value: DepositDto['status']) =>
      setDeposits((current) => current.map((item) => (item.id === deposit.id ? { ...item, status: value } : item)));

    // Optimistic update: status langsung berubah, lalu dikembalikan bila server gagal.
    setLocalStatus(nextStatus);
    setUpdatingIds((current) => new Set(current).add(deposit.id));
    try {
      await DepositsApi.setStatus(deposit.id, nextStatus);
    } catch (toggleError) {
      setLocalStatus(deposit.status);
      showErrorAlert('Gagal mengubah status', messageOf(toggleError));
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(deposit.id);
        return next;
      });
    }
  }, []);

  return { deposits, status, error, refreshing, adding, updatingIds, refresh, retry, addDeposit, toggleCompleted };
}
