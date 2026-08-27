# VitalStock

Platform manajemen stok dan pelacakan distribusi obat untuk klinik dan rumah sakit.

Dibuat oleh **Tim SIKATT** untuk HealTech Front-End Code Challenge 2026.

- Akmal Ardhia Irwansyah - UI/UX Designer
- Jascon Johanest Kembuan - Front-End Developer / Ketua Tim

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173

Untuk build produksi: `npm run build`, lalu `npm run preview` kalau mau cek hasilnya.

## Akun demo

Password semua akun: `vitalstock`

| Email | Peran |
| --- | --- |
| admin@vitalstock.id | Admin Farmasi |
| kepala@vitalstock.id | Kepala Instalasi Farmasi |
| staf@vitalstock.id | Staf Apotek Unit (tidak bisa approve) |

Tinggal klik salah satu akun di halaman login, formnya terisi otomatis.

## Halaman

- `/login`
- `/dashboard` - StockPulse, ringkasan stok dan grafik tren
- `/stok` - ExpiryGuard, tabel stok dengan indikator FEFO
- `/distribusi` - DistribusiTrack, peta jalur dan status pengiriman
- `/approval` - ApprovalFlow, persetujuan permintaan obat

## Tech stack

React 18 + Vite, Tailwind CSS, Recharts, lucide-react.
Animasi pakai GSAP (timeline login, reveal saat scroll, gambar path SVG,
counter angka) dan Framer Motion (transisi halaman, modal, layout, gesture).

Catatan: satu elemen jangan dianimasikan GSAP dan Framer sekaligus, keduanya
nulis ke inline style yang sama jadi elemennya bisa nyangkut di state awal.

## Struktur

```
src/
  components/   komponen reusable
  pages/        satu file per halaman
  data/         mockData.js
  lib/          api.js, format.js, motion.js
  store/        AuthContext, ThemeContext
```

## Data

Belum ada backend, semua data ada di `src/data/mockData.js` dan diakses lewat
`src/lib/api.js`. Fungsinya dibikin async pakai delay biar loading state-nya
kepakai, dan perubahan disimpan ke localStorage.

Perubahannya nyambung antar halaman. Kalau permintaan di ApprovalFlow
disetujui, stok gudang pusat ikut berkurang dan kelihatan di ExpiryGuard sama
dashboard.

Kalau nanti mau pakai API beneran tinggal ganti isi `api.js`, komponennya tidak
perlu diubah karena tidak ada yang import `mockData.js` langsung.

## Indikator warna (FEFO)

Aturannya ada di `src/lib/format.js`.

| Level | Sisa umur | Stok vs minimum |
| --- | --- | --- |
| Aman (hijau) | > 90 hari | >= 1.5x |
| Perhatian (amber) | 31-90 hari | 1 - 1.5x |
| Kritis (merah) | <= 30 hari | < 1x |

Badge di tiap baris ambil level yang paling parah dari dua kondisi itu.

Tanggal kedaluwarsa disimpan sebagai selisih hari dari waktu load, bukan tanggal
tetap, biar demonya tidak basi kalau dibuka bulan depan.

## Lain-lain

- Ada dark mode, pilihannya disimpan di localStorage
- Animasi dimatikan otomatis kalau OS-nya set `prefers-reduced-motion`
- Layout responsif, sidebar jadi drawer di mobile
