import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';

const PRODUCTS_URL = 'https://fakestoreapi.com/products';
const REQUEST_TIMEOUT_MS = 15_000;
const OFFLINE_MESSAGE = 'Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.';

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}

export type ProductsStatus =
  | 'loading'
  | 'checking'
  | 'retrying'
  | 'success'
  | 'error'
  | 'empty'
  | 'offline'
  | 'timeout';

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;
  return (
    typeof product.id === 'number' &&
    typeof product.title === 'string' &&
    typeof product.price === 'number' &&
    typeof product.category === 'string' &&
    typeof product.image === 'string'
  );
}

function getHttpErrorMessage(status: number): string {
  if (status === 400) {
    return 'Permintaan tidak valid. Silakan coba lagi.';
  }
  if (status === 401) {
    return 'Autentikasi diperlukan untuk mengakses data ini.';
  }
  if (status === 403) {
    return 'Anda tidak memiliki izin untuk mengakses data ini.';
  }
  if (status === 404) {
    return 'Data tidak ditemukan';
  }
  if (status >= 400 && status < 500) {
    return `Permintaan gagal (HTTP ${status}). Silakan coba lagi.`;
  }
  if (status >= 500) {
    return 'Terjadi kesalahan pada server. Silakan coba lagi.';
  }
  return 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
}

function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
  }

  const httpStatus = /^HTTP (\d+)$/.exec(error.message);
  if (httpStatus) {
    return getHttpErrorMessage(Number(httpStatus[1]));
  }

  if (
    error instanceof TypeError ||
    /network request failed|failed to fetch|network error/i.test(error.message)
  ) {
    return OFFLINE_MESSAGE;
  }

  if (error.message === 'Format data produk tidak valid.') {
    return error.message;
  }

  return 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
}

export function useFetchProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<ProductsStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestInProgress = useRef(false);
  const mounted = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (isRetry = false) => {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setProducts([]);
    setErrorMessage(null);
    setStatus(isRetry ? 'checking' : 'loading');

    let controller: AbortController | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let timedOut = false;

    try {
      const connection = await Promise.resolve()
        .then(() => NetInfo.fetch())
        .catch((error: unknown) => {
          if (
            error instanceof TypeError &&
            /addListener is not a function/.test(error.message)
          ) {
            console.warn(
              'NetInfo native listener is unavailable; checking connectivity through the API request.',
              error,
            );
            return null;
          }
          throw error;
        });
      if (!mounted.current) {
        return;
      }

      if (
        connection !== null &&
        (connection.isConnected === false || connection.isInternetReachable === false)
      ) {
        setErrorMessage(OFFLINE_MESSAGE);
        setStatus('offline');
        return;
      }

      if (isRetry) {
        setStatus('retrying');
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      if (!mounted.current) {
        return;
      }

      setStatus('loading');
      controller = new AbortController();
      controllerRef.current = controller;
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller?.abort();
      }, REQUEST_TIMEOUT_MS);

      const response = await fetch(PRODUCTS_URL, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: unknown = await response.json();
      if (!Array.isArray(payload) || !payload.every(isProduct)) {
        throw new Error('Format data produk tidak valid.');
      }

      if (!mounted.current) {
        return;
      }
      setProducts(payload);
      setStatus(payload.length === 0 ? 'empty' : 'success');
    } catch (error) {
      console.log('API Error:', error);
      if (!mounted.current) {
        return;
      }

      if (timedOut) {
        setErrorMessage('Server terlalu lama merespons.');
        setStatus('timeout');
      } else if (
        error instanceof TypeError ||
        (error instanceof Error &&
          /network request failed|failed to fetch|network error/i.test(error.message))
      ) {
        setErrorMessage(OFFLINE_MESSAGE);
        setStatus('offline');
      } else {
        setErrorMessage(getErrorMessage(error));
        setStatus('error');
      }
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
      requestInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const initialRequest = setTimeout(() => {
      void fetchProducts();
    }, 0);

    return () => {
      clearTimeout(initialRequest);
      mounted.current = false;
      controllerRef.current?.abort();
    };
  }, [fetchProducts]);

  const retry = useCallback(() => fetchProducts(true), [fetchProducts]);

  return { products, status, errorMessage, retry };
}
