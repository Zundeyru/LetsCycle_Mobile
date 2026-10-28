# LetCycle Mobile

Aplikasi mobile LetCycle dibuat dengan Expo, React Native, TypeScript, dan Expo Router. Backend autentikasi berjalan sebagai Expo Router API routes di project yang sama.

## Menjalankan aplikasi

```bash
npm install
npx expo start
```

`npx expo start` sekaligus menjalankan API di `/api/*`. Di perangkat/emulator, request relatif (`/api/...`) otomatis diarahkan ke dev server.

Halaman Home dapat dibuka tanpa akun. Location dan Marketplace saat ini berisi kerangka data contoh, sedangkan Account meminta pengguna masuk.

## Struktur folder

```
src/
  app/                 Route (layar) Expo Router
    api/               Backend: endpoint REST (+api.ts)
  server/              Kode khusus server — HANYA di-import dari +api.ts
    config.ts          Konfigurasi (TTL sesi, rate limit, iterasi hash)
    container.ts       Merakit service + repository
    db/                Database file JSON (pengembangan)
    repositories/      Akses data user & sesi (bisa diganti DB lain)
    security/          Hash password, util kripto, rate limiter
    services/          Logika bisnis autentikasi
    http/              Helper respons, header keamanan, cookie, body parser
  shared/              Dipakai client & server: tipe, error, validator
  lib/
    api/               HTTP client + AuthApi
    storage/           Penyimpanan token (SecureStore / cookie di web)
  context/             React context (AuthContext)
  components/ constants/
```

## API

| Method | Endpoint             | Keterangan                          |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/api/health`        | Cek server hidup                    |
| POST   | `/api/auth/register` | `{ name, email, password, confirmation }` |
| POST   | `/api/auth/login`    | `{ email, password }`               |
| POST   | `/api/auth/logout`   | Mencabut sesi                       |
| GET    | `/api/auth/me`       | Data user dari sesi aktif           |
| GET    | `/api/photos`        | Daftar foto milik user (terbaru dulu) |
| POST   | `/api/photos`        | Upload foto, `multipart/form-data` field `photo` (JPG/PNG/WebP, maks 5 MB) |
| GET    | `/api/photos/:id`    | Isi gambar — hanya pemiliknya       |
| DELETE | `/api/photos/:id`    | Hapus foto — hanya pemiliknya       |

Semua endpoint `/api/photos` butuh sesi login (header `Authorization: Bearer <token>` atau cookie sesi).

Sukses mengembalikan JSON data; gagal mengembalikan `{ "error": { "code", "message" } }` dengan status 400/401/409/413/429/500.

## Keamanan

- **Password** di-hash di server dengan PBKDF2-HMAC-SHA256 (600.000 iterasi, salt acak 16 byte), dibandingkan secara waktu-konstan. Login dengan email tak terdaftar tetap menjalankan hash agar waktu respons tidak membocorkan email.
- **Sesi** memakai token acak 256-bit. Server hanya menyimpan hash SHA-256 token, berlaku 30 hari, dan dicabut saat logout.
- **Penyimpanan token**: iOS/Android memakai `expo-secure-store` (Keychain/Keystore). Web memakai cookie `HttpOnly; SameSite=Strict` (ditambah `Secure` di HTTPS) sehingga token tidak bisa dibaca JavaScript.
- **Rate limit**: login 5x per email & 20x per IP, register 10x per IP, per 15 menit (respons 429 + `Retry-After`).
- **Validasi input** di server (client hanya untuk umpan balik cepat), batas ukuran body 10 KB, wajib `Content-Type: application/json` (menahan CSRF dari form).
- **Upload foto**: jenis file dicek dari isi (magic bytes), bukan nama/Content-Type kiriman client; ukuran dibatasi saat body dibaca; nama file dibuat server (UUID) sehingga tidak bisa path traversal; maks 100 foto per user dan 30 upload per 15 menit. Foto milik user lain selalu dijawab 404 agar ID-nya tidak bisa ditebak.
- **Header keamanan**: `Cache-Control: no-store`, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS di HTTPS. Detail error internal hanya dicatat di log server.

## Database & produksi

Data disimpan di `.data/db.json` dan file foto di `.data/uploads/` (di-ignore git; lokasi bisa diganti lewat env `DATA_DIR`). Ini cocok untuk pengembangan dan server Node dengan disk permanen.

Sebelum rilis:

1. Ganti `UserRepository`/`SessionRepository` di `src/server/repositories` dengan database sungguhan (Postgres, Turso, dsb.) — cukup implementasikan interface di `repositories/types.ts` lalu rakit di `container.ts`. EAS Hosting tidak menyediakan filesystem permanen. File foto juga perlu dipindah ke object storage (S3, Cloudflare R2, dsb.) dengan mengganti `LocalPhotoStorage` (interface `IPhotoFileStorage`).
2. Rate limiter berada di memori; untuk banyak instance pindahkan ke penyimpanan bersama (Redis/KV).
3. Deploy: `npx expo export -p web` lalu `npx eas-cli@latest deploy`.
4. Set `origin` di plugin `expo-router` pada `app.json` (atau env `EXPO_PUBLIC_API_URL`) ke URL HTTPS server agar aplikasi native memanggil API produksi.

## Catatan tampilan

Font Playfair Display dan Poppins dimuat melalui paket Google Fonts Expo. Ilustrasi hutan dan kegiatan pada Home adalah placeholder vektor lokal yang dibuat dengan komponen native; ganti dengan foto aset lokal saat aset final tersedia.
