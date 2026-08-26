# VitalStock

**Platform Manajemen Stok & Pelacakan Distribusi Obat**
Tim SIKATT — HealTech Front-End Code Challenge 2026

VitalStock adalah antarmuka web untuk mengelola stok obat sekaligus melacak alur
distribusinya secara real-time, menggantikan pencatatan manual yang lambat dan rawan
kesalahan dengan satu dashboard yang presisi dan mudah diaudit.

---

## Menjalankan proyek

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # bundel produksi ke dist/
npm run preview  # pratinjau hasil build
```

### Akun demo

Seluruh akun memakai kata sandi **`vitalstock`**. Tombol akun di halaman login
mengisi form secara otomatis.

| Email | Peran | Hak persetujuan |
| --- | --- | --- |
| `admin@vitalstock.id` | Admin Farmasi | ya |
| `kepala@vitalstock.id` | Kepala Instalasi Farmasi | ya |
| `staf@vitalstock.id` | Staf Apotek Unit | tidak (hanya memantau) |

Masuk sebagai Staf Apotek untuk melihat ApprovalFlow dalam mode baca-saja.

---

## Halaman

| Rute | Nama | Isi |
| --- | --- | --- |
| `/login` | Login | Timeline GSAP, garis EKG yang menggambar sendiri, pemilih akun demo |
| `/dashboard` | **StockPulse** | KPI, tren arus stok, komposisi kategori, permintaan per unit, FEFO, log aktivitas |
| `/stok` | **ExpiryGuard** | Tabel stok dengan indikator FEFO, pencarian, filter, pengurutan, modal restock |
| `/distribusi` | **DistribusiTrack** | Peta jalur SVG, rail checkpoint, kartu pengiriman, rantai dingin |
| `/approval` | **ApprovalFlow** | Persetujuan/penolakan permintaan obat dengan catatan keputusan |

---

## Tech stack

- **React 18** + **Vite** — SPA dengan `react-router-dom`
- **Tailwind CSS** — token warna semantik berbasis CSS variable
- **GSAP** (+ ScrollTrigger) — timeline, reveal saat scroll, penggambaran path SVG, penghitung angka
- **Framer Motion** — transisi halaman, motion siklus hidup komponen, layout, gesture
- **Recharts** — Area, Pie, dan Bar chart
- **lucide-react** — pustaka ikon

### Pembagian tugas animasi

Dua pustaka animasi dipakai untuk peran yang **tidak tumpang tindih**:

- **GSAP** menangani hal imperatif dan berurutan: timeline login, stagger menu
  samping, penggambaran path SVG, penghitung angka, reveal saat scroll.
- **Framer Motion** menangani siklus hidup komponen: mount/unmount, transisi
  halaman, `layoutId`, dan gesture.

> **Aturan penting:** satu elemen hanya boleh dianimasikan oleh **satu** pustaka.
> Keduanya menulis ke `style` inline yang sama, sehingga elemen yang dianimasikan
> GSAP *dan* Framer akan tersangkut di state awal dan tampak tidak terlihat.
> Karena itu komponen `motion.*` tidak pernah diberi kelas `.reveal`.

---

## Struktur folder

```
src/
├── components/     # Reusable: Sidebar, Topbar, StatCard, StatusBadge, ChartKit, Toast…
├── pages/          # Satu berkas per layar
├── data/           # mockData.js — satu-satunya sumber data contoh
├── lib/
│   ├── api.js      # Backend dummy (Promise + latensi + localStorage)
│   ├── format.js   # Aturan FEFO/level stok + format angka & rupiah
│   └── motion.js   # Easing, varian Framer, helper GSAP
└── store/          # AuthContext, ThemeContext
```

---

## Backend dummy

`src/lib/api.js` meniru API sungguhan: setiap fungsi mengembalikan `Promise`,
selesai setelah jeda acak (agar loading state benar-benar terpakai), dan
menyimpan perubahan ke `localStorage`.

```js
login(email, password)          getDashboard()
getMedicines()                  getShipments()        getRequests()
decideRequest(id, decision, note)
advanceShipment(id)             restock(id, qty)      resetDatabase()
```

Mutasi saling terhubung — menyetujui permintaan di ApprovalFlow **mengurangi stok
gudang pusat**, dan angkanya langsung terlihat di ExpiryGuard maupun StockPulse.
Mengganti berkas ini dengan panggilan `fetch` adalah satu-satunya perubahan yang
dibutuhkan untuk memakai API sungguhan; tidak ada komponen yang menyentuh
`mockData.js` secara langsung.

---

## Aturan indikator warna (FEFO)

Ditetapkan sekali di `src/lib/format.js` agar badge, tabel, dan grafik tidak
pernah berbeda pendapat.

| Level | Sisa umur simpan | Stok terhadap minimum | Warna |
| --- | --- | --- | --- |
| Aman | > 90 hari | ≥ 1,5× | hijau |
| Perhatian | 31–90 hari | 1–1,5× | amber |
| Kritis | ≤ 30 hari | < 1× | merah |

Badge pada satu baris selalu menampilkan level **terburuk** dari kedua sinyal itu.

Tanggal kedaluwarsa disimpan sebagai selisih hari terhadap waktu muat, bukan
tanggal tetap, sehingga demo tidak pernah basi.

---

## Aksesibilitas

- Mode terang & gelap dengan kontras yang dijaga di kedua tema; pilihan tersimpan
  di `localStorage` dan diterapkan sebelum paint pertama sehingga tidak berkedip.
- Seluruh gerak dekoratif dimatikan pada `prefers-reduced-motion: reduce`.
- Angka memakai *tabular figures* agar rapi saat dibaca dalam kolom.
- Ikon dekoratif diberi `aria-hidden`, tombol ikon diberi `aria-label`.
