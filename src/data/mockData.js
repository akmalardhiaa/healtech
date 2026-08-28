// Data contoh. Komponen tidak pernah import file ini langsung, semuanya
// lewat src/lib/api.js.

// akun demo

export const users = [
  {
    id: 'u-01',
    email: 'admin@vitalstock.id',
    password: 'vitalstock',
    name: 'Akmal Ardhia Irwansyah',
    role: 'Admin Farmasi',
    unit: 'Instalasi Farmasi Pusat',
    initials: 'AA',
    canApprove: true,
  },
  {
    id: 'u-02',
    email: 'kepala@vitalstock.id',
    password: 'vitalstock',
    name: 'Jascon Johanest Kembuan',
    role: 'Kepala Instalasi Farmasi',
    unit: 'Manajemen Klinik',
    initials: 'JK',
    canApprove: true,
  },
  {
    id: 'u-03',
    email: 'staf@vitalstock.id',
    password: 'vitalstock',
    name: 'Nadia Prameswari',
    role: 'Staf Apotek Unit',
    unit: 'Apotek Rawat Jalan',
    initials: 'NP',
    canApprove: false,
  },
]

// expiry disimpan sebagai selisih hari dari hari ini, bukan tanggal tetap,
// biar indikator FEFO-nya tetap masuk akal kapan pun demo dibuka
const catalogue = [
  // nama, kategori, satuan, stok, minStok, expiryDalamHari, batch, supplier, harga, pakaiPerHari
  ['Paracetamol 500mg', 'Analgesik', 'Tablet', 4820, 1200, 412, 'PCM-24A', 'PT Kimia Farma', 850, 95],
  ['Amoxicillin 500mg', 'Antibiotik', 'Kapsul', 940, 1000, 168, 'AMX-24C', 'PT Kalbe Farma', 1750, 42],
  ['Ceftriaxone 1g', 'Antibiotik', 'Vial', 148, 200, 54, 'CFT-24B', 'PT Sanbe Farma', 24500, 9],
  ['Insulin Glargine', 'Hormon', 'Pen', 62, 80, 26, 'INS-24D', 'PT Novo Nordisk', 187000, 3],
  ['Ranitidine 150mg', 'Antasida', 'Tablet', 2140, 800, 96, 'RAN-24A', 'PT Dexa Medica', 920, 38],
  ['Salbutamol Inhaler', 'Bronkodilator', 'Tabung', 214, 120, 288, 'SLB-24A', 'PT Combiphar', 68500, 4],
  ['Furosemide 40mg', 'Diuretik', 'Tablet', 1680, 600, 341, 'FUR-24B', 'PT Hexpharm', 640, 26],
  ['Metformin 500mg', 'Antidiabetik', 'Tablet', 3960, 1500, 233, 'MET-24A', 'PT Dexa Medica', 780, 74],
  ['Omeprazole 20mg', 'Antasida', 'Kapsul', 1290, 700, 71, 'OMP-24C', 'PT Kalbe Farma', 1420, 31],
  ['Dexamethasone 0.5mg', 'Kortikosteroid', 'Tablet', 2480, 900, 195, 'DEX-24A', 'PT Kimia Farma', 560, 44],
  ['Heparin 5000 IU', 'Antikoagulan', 'Vial', 88, 150, 41, 'HEP-24B', 'PT Fahrenheit', 96000, 6],
  ['Ondansetron 4mg', 'Antiemetik', 'Ampul', 412, 250, 122, 'OND-24A', 'PT Novell', 12400, 14],
  ['Ringer Laktat 500ml', 'Cairan Infus', 'Botol', 1840, 900, 468, 'RL-24E', 'PT Otsuka', 14500, 58],
  ['Morfin 10mg', 'Analgesik Narkotik', 'Ampul', 34, 60, 87, 'MOR-24A', 'PT Kimia Farma', 42000, 2],
  ['Vitamin K 10mg', 'Vitamin', 'Ampul', 620, 200, 302, 'VTK-24B', 'PT Phapros', 8900, 11],
  ['Atorvastatin 20mg', 'Antikolesterol', 'Tablet', 2760, 1000, 218, 'ATV-24A', 'PT Dexa Medica', 1980, 49],
  ['Ampicillin 1g', 'Antibiotik', 'Vial', 176, 180, 19, 'AMP-24D', 'PT Sanbe Farma', 18700, 12],
  ['Diazepam 5mg', 'Sedatif', 'Ampul', 96, 80, 143, 'DZP-24A', 'PT Kimia Farma', 22500, 3],
  ['Epinefrin 1mg', 'Vasokonstriktor', 'Ampul', 58, 100, 63, 'EPI-24B', 'PT Ethica', 31000, 4],
  ['Cetirizine 10mg', 'Antihistamin', 'Tablet', 1920, 600, 376, 'CTZ-24A', 'PT Sanbe Farma', 690, 33],
  ['Ibuprofen 400mg', 'Analgesik', 'Tablet', 3240, 1200, 259, 'IBU-24C', 'PT Kalbe Farma', 720, 61],
  ['Asam Traneksamat 500mg', 'Hemostatik', 'Ampul', 268, 200, 11, 'ATX-24A', 'PT Novell', 16800, 16],
  ['Lidokain 2%', 'Anestesi Lokal', 'Vial', 342, 150, 224, 'LDK-24B', 'PT Fahrenheit', 9400, 13],
  ['Natrium Diklofenak 50mg', 'Antiinflamasi', 'Tablet', 1460, 700, 158, 'NDF-24A', 'PT Hexpharm', 890, 28],
]

const DAY = 86_400_000

export const medicines = catalogue.map(
  ([name, category, unit, stock, minStock, days, batch, supplier, price, dailyUsage], i) => ({
    id: `MED-${String(i + 1).padStart(3, '0')}`,
    name,
    category,
    unit,
    stock,
    minStock,
    batch,
    supplier,
    price,
    dailyUsage,
    expiry: new Date(Date.now() + days * DAY).toISOString(),
    location: ['Gudang Pusat', 'Apotek Rawat Jalan', 'Apotek Rawat Inap', 'Depo IGD'][i % 4],
  })
)

// Riwayat pergerakan tiap obat (kartu stok). Dibangun mundur dari stok
// sekarang supaya saldo tiap baris selalu nyambung. Angka acaknya memakai
// seed tetap biar isinya tidak berubah tiap halaman dimuat ulang.
const seeded = (seed) => {
  let s = seed
  return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648
}

const sumber = ['PT Kimia Farma', 'PT Kalbe Farma', 'PT Sanbe Farma', 'Gudang Pusat']
const tujuan = ['Apotek Rawat Jalan', 'Apotek Rawat Inap', 'Depo IGD', 'Kamar Operasi', 'Poli Anak']

export const movements = Object.fromEntries(
  medicines.map((m, i) => {
    const acak = seeded(i * 31 + 7)
    const rows = []
    let saldo = m.stock
    let lalu = 0

    for (let k = 0; k < 9; k++) {
      const masuk = acak() > 0.6
      const qty = masuk
        ? Math.max(10, Math.round(m.minStock * (0.5 + acak())))
        : Math.max(1, Math.round(m.dailyUsage * (2 + acak() * 7)))

      rows.push({
        id: `${m.id}-MV${k}`,
        type: masuk ? 'masuk' : 'keluar',
        qty,
        saldo,
        ref: masuk ? `PO-${2400 + i * 3 + k}` : `REQ-${3300 + i * 2 + k}`,
        pihak: masuk ? sumber[(i + k) % sumber.length] : tujuan[(i + k) % tujuan.length],
        at: new Date(Date.now() - lalu * DAY).toISOString(),
      })

      // mundurkan saldo ke kondisi sebelum transaksi ini
      saldo = masuk ? saldo - qty : saldo + qty
      if (saldo < 0) saldo = qty
      lalu += 2 + Math.floor(acak() * 7)
    }

    return [m.id, rows]
  })
)

// stage = index checkpoint terakhir yang sudah dilewati
export const shipmentStages = [
  'Diproses Gudang',
  'Dalam Perjalanan',
  'Tiba di Unit',
  'Diterima & Diverifikasi',
]

export const shipments = [
  {
    id: 'SHP-20481',
    origin: 'Gudang Pusat',
    destination: 'Apotek Rawat Inap',
    driver: 'Bagas Nugroho',
    vehicle: 'B 9241 KYU',
    items: 12,
    weight: '48 kg',
    stage: 1,
    priority: 'Reguler',
    eta: '35 menit',
    etaEn: '35 min',
    departedAt: '08:12',
    temperature: '4.2°C',
  },
  {
    id: 'SHP-20482',
    origin: 'Gudang Pusat',
    destination: 'Depo IGD',
    driver: 'Rizky Ananda',
    vehicle: 'B 1178 SQD',
    items: 5,
    weight: '9 kg',
    stage: 2,
    priority: 'Urgent',
    eta: '8 menit',
    etaEn: '8 min',
    departedAt: '09:40',
    temperature: '2.8°C',
  },
  {
    id: 'SHP-20483',
    origin: 'Gudang Pusat',
    destination: 'Apotek Rawat Jalan',
    driver: 'Sinta Maulida',
    vehicle: 'B 4023 ZTR',
    items: 28,
    weight: '112 kg',
    stage: 3,
    priority: 'Reguler',
    eta: 'Selesai',
    etaEn: 'Completed',
    departedAt: '06:55',
    temperature: '5.1°C',
  },
  {
    id: 'SHP-20484',
    origin: 'Gudang Pusat',
    destination: 'Poli Anak',
    driver: 'Hendra Wijaya',
    vehicle: 'B 7756 MLA',
    items: 9,
    weight: '21 kg',
    stage: 0,
    priority: 'Reguler',
    eta: '1 jam 20 menit',
    etaEn: '1 hr 20 min',
    departedAt: '-',
    temperature: '4.0°C',
  },
  {
    id: 'SHP-20485',
    origin: 'Gudang Pusat',
    destination: 'Kamar Operasi',
    driver: 'Yusuf Ramadhan',
    vehicle: 'B 3390 PKB',
    items: 16,
    weight: '37 kg',
    stage: 2,
    priority: 'Urgent',
    eta: '12 menit',
    etaEn: '12 min',
    departedAt: '09:05',
    temperature: '3.6°C',
  },
  {
    id: 'SHP-20486',
    origin: 'Gudang Pusat',
    destination: 'Apotek Rawat Inap',
    driver: 'Dewi Anggraini',
    vehicle: 'B 6612 JHT',
    items: 22,
    weight: '76 kg',
    stage: 3,
    priority: 'Reguler',
    eta: 'Selesai',
    etaEn: 'Completed',
    departedAt: '07:30',
    temperature: '4.8°C',
  },
]

export const requests = [
  {
    id: 'REQ-3391',
    medicine: 'Ceftriaxone 1g',
    qty: 60,
    unit: 'Vial',
    requester: 'dr. Prasetyo Wibowo',
    unitName: 'Depo IGD',
    reason: 'Lonjakan kasus sepsis pada shift malam, stok depo tersisa 12 vial.',
    reasonEn: 'Surge in sepsis cases on the night shift; only 12 vials left in the depot.',
    priority: 'Urgent',
    submittedAt: '18 menit lalu',
    submittedAtEn: '18 minutes ago',
    status: 'pending',
  },
  {
    id: 'REQ-3390',
    medicine: 'Insulin Glargine',
    qty: 24,
    unit: 'Pen',
    requester: 'Nadia Prameswari',
    unitName: 'Apotek Rawat Jalan',
    reason: 'Permintaan rutin pasien diabetes kontrol mingguan.',
    reasonEn: 'Routine request for weekly diabetes follow-up patients.',
    priority: 'Reguler',
    submittedAt: '52 menit lalu',
    submittedAtEn: '52 minutes ago',
    status: 'pending',
  },
  {
    id: 'REQ-3389',
    medicine: 'Morfin 10mg',
    qty: 20,
    unit: 'Ampul',
    requester: 'dr. Lestari Handayani',
    unitName: 'Kamar Operasi',
    reason: 'Jadwal operasi elektif bertambah 6 tindakan minggu ini.',
    reasonEn: 'Six additional elective surgeries scheduled this week.',
    priority: 'Urgent',
    submittedAt: '1 jam lalu',
    submittedAtEn: '1 hour ago',
    status: 'pending',
  },
  {
    id: 'REQ-3388',
    medicine: 'Ringer Laktat 500ml',
    qty: 200,
    unit: 'Botol',
    requester: 'Bagus Setiawan',
    unitName: 'Apotek Rawat Inap',
    reason: 'Restock mingguan cairan infus lantai 3 dan 4.',
    reasonEn: 'Weekly infusion fluid restock for floors 3 and 4.',
    priority: 'Reguler',
    submittedAt: '2 jam lalu',
    submittedAtEn: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'REQ-3387',
    medicine: 'Epinefrin 1mg',
    qty: 40,
    unit: 'Ampul',
    requester: 'dr. Rahmat Hidayat',
    unitName: 'Depo IGD',
    reason: 'Pengisian ulang troli emergensi seluruh lantai.',
    reasonEn: 'Refilling the emergency trolleys on every floor.',
    priority: 'Urgent',
    submittedAt: '3 jam lalu',
    submittedAtEn: '3 hours ago',
    status: 'approved',
  },
  {
    id: 'REQ-3386',
    medicine: 'Paracetamol 500mg',
    qty: 5000,
    unit: 'Tablet',
    requester: 'Nadia Prameswari',
    unitName: 'Apotek Rawat Jalan',
    reason: 'Permintaan melebihi kuota bulanan unit.',
    reasonEn: 'Request exceeds the unit monthly quota.',
    priority: 'Reguler',
    submittedAt: '5 jam lalu',
    submittedAtEn: '5 hours ago',
    status: 'rejected',
  },
  {
    id: 'REQ-3385',
    medicine: 'Salbutamol Inhaler',
    qty: 30,
    unit: 'Tabung',
    requester: 'dr. Maya Kusuma',
    unitName: 'Poli Anak',
    reason: 'Peningkatan kunjungan asma anak pada musim pancaroba.',
    reasonEn: 'More paediatric asthma visits during the transitional season.',
    priority: 'Reguler',
    submittedAt: '6 jam lalu',
    submittedAtEn: '6 hours ago',
    status: 'approved',
  },
]

export const consumptionTrend = [
  { month: 'Feb', masuk: 12400, keluar: 9800, sisa: 41200 },
  { month: 'Mar', masuk: 14200, keluar: 11600, sisa: 43800 },
  { month: 'Apr', masuk: 11800, keluar: 13400, sisa: 42200 },
  { month: 'Mei', masuk: 16400, keluar: 12900, sisa: 45700 },
  { month: 'Jun', masuk: 13900, keluar: 15200, sisa: 44400 },
  { month: 'Jul', masuk: 17600, keluar: 14100, sisa: 47900 },
  { month: 'Agu', masuk: 15200, keluar: 16800, sisa: 46300 },
]

export const categoryMix = [
  { name: 'Antibiotik', value: 28 },
  { name: 'Analgesik', value: 22 },
  { name: 'Cairan Infus', value: 18 },
  { name: 'Antidiabetik', value: 14 },
  { name: 'Lainnya', value: 18 },
]

export const unitDemand = [
  { unit: 'Rawat Inap', permintaan: 342 },
  { unit: 'Rawat Jalan', permintaan: 286 },
  { unit: 'IGD', permintaan: 214 },
  { unit: 'Kamar Operasi', permintaan: 168 },
  { unit: 'Poli Anak', permintaan: 124 },
]

export const activityFeed = [
  { id: 1, type: 'danger', text: 'Ampicillin 1g memasuki status kritis, sisa 19 hari.', textEn: 'Ampicillin 1g is now critical, 19 days left.', time: '4 mnt' },
  { id: 2, type: 'primary', text: 'SHP-20482 berangkat menuju Depo IGD.', textEn: 'SHP-20482 departed for the ER Depot.', time: '12 mnt' },
  { id: 3, type: 'warn', text: 'Permintaan REQ-3391 menunggu persetujuan.', textEn: 'Request REQ-3391 is awaiting approval.', time: '18 mnt' },
  { id: 4, type: 'vital', text: 'SHP-20483 diterima & diverifikasi Apotek Rawat Jalan.', textEn: 'SHP-20483 received & verified by Outpatient Pharmacy.', time: '41 mnt' },
  { id: 5, type: 'primary', text: 'Stok Metformin 500mg ditambah 2.000 tablet.', textEn: 'Metformin 500mg stock increased by 2,000 tablets.', time: '1 jam' },
  { id: 6, type: 'warn', text: 'Heparin 5000 IU di bawah stok minimum.', textEn: 'Heparin 5000 IU is below minimum stock.', time: '2 jam' },
]
