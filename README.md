# LetCycle Mobile

Aplikasi mobile LetCycle dibuat dengan Expo, React Native, TypeScript, dan Expo Router.

## Menjalankan aplikasi

```bash
npm install
npx expo start
```

Halaman Home dapat dibuka tanpa akun. Location dan Marketplace saat ini berisi kerangka data contoh, sedangkan Account meminta pengguna masuk. Tombol Masuk dan Daftar tersedia dari Home. Tab Account memiliki aksi keluar.

## Penyimpanan akun tahap belajar

File seed `src/data/users.txt` dan `src/data/session.txt` dibundel oleh Metro sebagai aset teks. Saat aplikasi pertama kali dijalankan, `FileStorage` menyalinnya ke document directory aplikasi; semua pembacaan dan penulisan berikutnya dilakukan di sana karena aplikasi tidak dapat menulis ke folder source.

Password disimpan sebagai salt acak dan hash SHA-256, bukan teks polos. Implementasi file lokal ini hanya untuk pembelajaran/prototipe: SHA-256 bukan algoritma password hashing yang direkomendasikan untuk produksi, dan file lokal tidak menyediakan autentikasi atau sinkronisasi yang aman. Gunakan backend autentikasi dan penyimpanan kredensial yang sesuai sebelum rilis produksi.

Folder `src/data/` hanya berisi seed awal. `metro.config.js` menambahkan ekstensi `.txt` sebagai aset agar seed dapat dimuat di aplikasi.
Untuk preview web, `FileStorage.web.ts` memakai `localStorage`; penyimpanan file `.txt` tetap digunakan pada iOS dan Android.

## Catatan tampilan

Font Playfair Display dan Poppins dimuat melalui paket Google Fonts Expo. Ilustrasi hutan dan kegiatan pada Home adalah placeholder vektor lokal yang dibuat dengan komponen native; ganti dengan foto aset lokal saat aset final tersedia.
