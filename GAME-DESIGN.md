# Warung Rush — Game Design (make.fun cooking game bounty)

Konsep: warung makan kaki lima Indonesia. Pemain jadi juru masak tunggal:
terima pesanan, masak di beberapa stasiun, tata di piring, sajikan sebelum
pelanggan kehabisan sabar. Satu shift, tempo makin ngebut sampai rush hour.

## Yang harus kelihatan di screenshot utama (juri menilai dari sini)

Satu layar permainan penuh: dapur warung, papan pesanan di atas, bahan-bahan
di meja counter, satu hidangan yang sedang dirakit, timer yang jelas, dan
satu piring siap saji. Semua elemen ini harus terbaca sekilas saat gambar
diperkecil.

## Mekanik

- Papan pesanan: 3-4 slot pesanan aktif, masing-masing dengan bar kesabaran
  yang menyusut. Pesanan selesai tepat waktu = koin + skor; kesabaran habis
  = pelanggan pergi, skor reputasi turun.
- 4 resep, tiap resep gabungan 2-4 bahan: Nasi Goreng, Mie Ayam, Sate Ayam,
  Es Teh. Resep ditampilkan sebagai ikon bahan, tanpa teks panjang.
- 4 stasiun: Wajan (memasak, butuh waktu), Panggangan (sate, butuh waktu),
  Talenan (potong bahan, instan per klik), Rak Minuman (es teh, instan).
  Masakan yang sudah matang harus segera dipindahkan, kalau tidak gosong.
- Alur satu hidangan: ambil bahan dari counter, olah di stasiun yang benar,
  rakit di piring, sajikan ke pelanggan yang memesan. Salah rakit bisa
  dibuang ke tempat sampah.
- Tekanan naik: shift berjalan 3 menit; tiap 45 detik pesanan datang lebih
  cepat dan sabar pelanggan lebih pendek. Rush hour di menit terakhir.
- Skor: koin per hidangan, bonus kecepatan, kombo pesanan beruntun tanpa
  gagal. Game over saat reputasi habis; layar hasil menampilkan skor, koin,
  hidangan tersaji, dan tombol main lagi.

## Kontrol & feel

- Mouse utama: klik bahan, klik stasiun, klik piring, klik pelanggan untuk
  menyajikan. Keyboard 1-4 memilih stasiun, Spasi mengambil/menaruh cepat.
- Tiap aksi dibalas langsung: animasi potong, bunyi "cess" wajan, piring
  meluncur ke pelanggan. Timer terasa: bar menyusut + warna berubah saat
  hampir habis + papan pesanan berkedip saat rush.

## Tampilan (orisinil, bukan tiruan game komersial)

- Palet warung hangat: terakota, krem, hijau daun, kuning kunyit; tenda
  garis-garis di atas counter. Tanpa gradien ungu-biru, tanpa glow neon.
- Semua gambar digambar prosedural di canvas (bentuk + warna), tanpa file
  gambar eksternal dan tanpa request jaringan apa pun. Nama-nama Indonesia:
  "Warung Bu Sari", hidangan dan bahan bernama Indonesia.
- Bunyi disintesis dengan WebAudio (klik, desis, denting), tanpa file audio.

## Struktur kode (satu file satu tugas, nama jelas)

- index.html — kerangka halaman + canvas
- src/main.js — game loop + state shift
- src/recipes.js — daftar resep dan bahan
- src/orders.js — antrean pesanan + kesabaran pelanggan
- src/kitchen.js — stasiun masak + status matang/gosong
- src/render.js — semua gambar canvas
- src/input.js — mouse + keyboard
- src/audio.js — bunyi WebAudio
- src/shots.js — mode staging screenshot (lihat bawah)
- src/config.js — angka-angka tuning (durasi, harga, kecepatan)

## Mode staging screenshot

Game membaca query URL `?shot=` dan `?seed=`:
- shot=start — layar judul + dapur utuh, tanpa pesanan aktif.
- shot=play — tengah rush: papan pesanan penuh, satu hidangan setengah
  dirakit di piring, timer berjalan, satu piring siap saji.
- shot=end — layar hasil dengan skor.
Seed membuat tata letak deterministik supaya screenshot bisa diulang sama.

## main.ts (root repo, Node 22, standard library saja)

Menyalin game/ dan screenshots/ dari repo ke direktori output
(MAKEFUN_OUTPUT_DIR, atau /output) lalu menulis dossier.json memakai
fungsi buildDossier dari vendor/makefun-game.ts (file kit, jangan diubah).
Juga sediakan serve.ts kecil untuk melayani game/ secara lokal saat
play-test.

## Batasan teknis (aturan bounty)

- game/ hanya file statis, tanpa build step; index.html dibuka di Chrome
  desktop dan langsung bisa dimainkan offline.
- Tidak ada request jaringan: semua script, gambar, bunyi, font adalah file
  di dalam game/ atau data URI. Tanpa library eksternal; vanilla JS + canvas.
- Tanpa eval, tanpa Function constructor, tanpa service worker, tanpa cookie.
- Tulis semua kode sendiri dari nol di sesi ini. Jangan salin file starter
  kit (main.ts starter hanya dibaca sebagai contoh cara memakai
  buildDossier, lalu tulis versimu sendiri). File vendor/makefun-game.ts
  adalah salinan kit yang tidak diubah.
