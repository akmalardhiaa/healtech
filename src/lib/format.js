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

export const levelLabel = {
  safe: 'Aman',
  warning: 'Perhatian',
  critical: 'Kritis',
}

const nf = new Intl.NumberFormat('id-ID')
export const num = (n) => nf.format(Math.round(n))

const cf = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})
export const rupiah = (n) => cf.format(n)

export function rupiahShort(n) {
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(1)} T`
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} jt`
  return rupiah(n)
}

export const dateID = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
