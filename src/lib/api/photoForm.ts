import { Platform } from 'react-native';

/** FormData berisi satu foto di field `photo`, dari URI hasil kamera. */
export async function buildPhotoForm(localUri: string): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    // Di web, kamera mengembalikan data URI base64; ubah ke Blob dulu.
    const blob = await (await fetch(localUri)).blob();
    form.append('photo', blob, 'photo.jpg');
  } else {
    // React Native mengirim file langsung dari path lokal tanpa memuatnya ke memori JS.
    form.append('photo', { uri: localUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  return form;
}
