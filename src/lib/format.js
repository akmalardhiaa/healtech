const DAY = 86_400_000

export const daysUntil = (iso) => Math.ceil((new Date(iso) - Date.now()) / DAY)

// FEFO: <= 30 hari kritis, <= 90 hari perlu rotasi stok
export function expiryLevel(iso) {
  const d = daysUntil(iso)
  if (d <= 30) return 'critical'
  if (d <= 90) return 'warning'
  return 'safe'
}

export function stockLevel(stock, minStock) {
  const ratio = stock / Math.max(1, minStock)
  if (ratio < 1) return 'critical'
  if (ratio < 1.5) return 'warning'
  return 'safe'
}

// ambil level terburuk dari expiry vs stok, ini yang dipakai badge
export function overallLevel(med) {
  const order = { safe: 0, warning: 1, critical: 2 }
  const a = expiryLevel(med.expiry)
  const b = stockLevel(med.stock, med.minStock)
  return order[a] >= order[b] ? a : b
}

// Perkiraan berapa hari lagi stok habis kalau laju pakainya tetap.
// null artinya obat ini tidak terpakai sama sekali, jadi tidak bisa diprediksi.
export function daysToStockout(med) {
  if (!med.dailyUsage || med.dailyUsage <= 0) return null
  return Math.floor(med.stock / med.dailyUsage)
}

// <= 7 hari harus dipesan hari ini, <= 21 hari masuk rencana pemesanan
export function stockoutLevel(med) {
  const d = daysToStockout(med)
  if (d === null) return 'safe'
  if (d <= 7) return 'critical'
  if (d <= 21) return 'warning'
  return 'safe'
}

// tanggal perkiraan habis, untuk ditampilkan di samping jumlah hari
export function stockoutDate(med) {
  const d = daysToStockout(med)
  return d === null ? null : new Date(Date.now() + d * DAY).toISOString()
}

export const levelLabel = {
  safe: 'Aman',
  warning: 'Perhatian',
  critical: 'Kritis',
}

// locale menyusul bahasa yang dipilih; mata uang tetap rupiah
const nfCache = {}
const nf = (loc = 'id-ID') => (nfCache[loc] ??= new Intl.NumberFormat(loc))
export const num = (n, loc) => nf(loc).format(Math.round(n))

const cfCache = {}
const cf = (loc = 'id-ID') =>
  (cfCache[loc] ??= new Intl.NumberFormat(loc, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }))
export const rupiah = (n, loc) => cf(loc).format(n)

export function rupiahShort(n, loc = 'id-ID') {
  const en = loc.startsWith('en')
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(1)}${en ? 'T' : ' T'}`
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}${en ? 'B' : ' M'}`
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}${en ? 'M' : ' jt'}`
  return rupiah(n, loc)
}

export const dateID = (iso, loc = 'id-ID') =>
  new Date(iso).toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' })
