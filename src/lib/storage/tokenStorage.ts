import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'letcycle.session_token';
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** Native: token disimpan terenkripsi di iOS Keychain / Android Keystore. */
export const TokenStorage = {
  /** Di native sesi dibawa lewat header Authorization, bukan cookie. */
  usesCookieSession: false,
  get: () => SecureStore.getItemAsync(TOKEN_KEY, options),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token, options),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY, options),
};
