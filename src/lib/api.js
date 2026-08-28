// Mock API. Semua fungsi return Promise + delay biar loading state kepakai.
// Kalau nanti ganti ke API beneran, cukup ubah file ini saja.
import {
  users,
  medicines,
  shipments,
  requests as seedRequests,
  movements as seedMovements,
  consumptionTrend,
  categoryMix,
  unitDemand,
  activityFeed,
} from '@/data/mockData'

const STORE_KEY = 'vitalstock:db'

const latency = (min = 260, max = 620) =>
  new Promise((r) => setTimeout(r, min + Math.random() * (max - min)))

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // storage rusak / dimatikan, pakai seed saja
  }
  return null
}

function writeStore(db) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db))
  } catch {
    // private mode atau quota penuh, in-memory masih jalan
  }
}

let db = readStore() ?? {
  medicines,
  shipments,
  requests: seedRequests,
  movements: seedMovements,
}

// tanggal expiry dihitung dari waktu load, jadi field read-only-nya
// di-seed ulang dan cuma stock yang diambil dari localStorage
db.medicines = medicines.map((m) => {
  const saved = db.medicines?.find((s) => s.id === m.id)
  return saved ? { ...m, stock: saved.stock } : m
})

if (!db.movements) db.movements = seedMovements

const persist = () => writeStore(db)
const clone = (v) => JSON.parse(JSON.stringify(v))

export async function login(email, password) {
  await latency(650, 1100)
  const user = users.find(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
  )
  if (!user) {
    const err = new Error('Email atau kata sandi tidak cocok.')
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }
  const { password: _pw, ...safe } = user
  return safe
}

export const demoAccounts = users.map(({ password: _pw, ...u }) => u)

export async function getMedicines() {
  await latency()
  return clone(db.medicines)
}

export async function getShipments() {
  await latency()
  return clone(db.shipments)
}

export async function getRequests() {
  await latency()
  return clone(db.requests)
}

export async function getDashboard() {
  await latency(320, 700)
  return clone({
    medicines: db.medicines,
    shipments: db.shipments,
    requests: db.requests,
    consumptionTrend,
    categoryMix,
    unitDemand,
    activityFeed,
  })
}

export async function getMovements(medId) {
  await latency(220, 480)
  return clone(db.movements[medId] ?? [])
}

// tiap perubahan stok dicatat di kartu stok, saldonya ikut jalan
function catat(med, type, qty, ref, pihak) {
  const rows = db.movements[med.id] ?? (db.movements[med.id] = [])
  rows.unshift({
    id: `${med.id}-MV${Date.now()}`,
    type,
    qty,
    saldo: med.stock,
    ref,
    pihak,
    at: new Date().toISOString(),
  })
}

export async function decideRequest(id, decision, note = '') {
  await latency(420, 780)
  const req = db.requests.find((r) => r.id === id)
  if (!req) throw new Error(`Permintaan ${id} tidak ditemukan.`)

  req.status = decision
  req.note = note
  req.decidedAt = 'baru saja'

  // request yang disetujui mengurangi stok gudang pusat
  if (decision === 'approved') {
    const med = db.medicines.find((m) => m.name === req.medicine)
    if (med) {
      med.stock = Math.max(0, med.stock - req.qty)
      catat(med, 'keluar', req.qty, req.id, req.unitName)
    }
  }

  persist()
  return clone(req)
}

export async function advanceShipment(id) {
  await latency(300, 560)
  const shp = db.shipments.find((s) => s.id === id)
  if (!shp) throw new Error(`Pengiriman ${id} tidak ditemukan.`)
  shp.stage = Math.min(3, shp.stage + 1)
  if (shp.stage === 3) {
    shp.eta = 'Selesai'
    shp.etaEn = 'Completed'
  }
  persist()
  return clone(shp)
}

export async function restock(id, qty) {
  await latency(340, 620)
  const med = db.medicines.find((m) => m.id === id)
  if (!med) throw new Error(`Obat ${id} tidak ditemukan.`)
  med.stock += qty
  catat(med, 'masuk', qty, `PO-${Date.now().toString().slice(-4)}`, med.supplier)
  persist()
  return clone(med)
}

export function resetDatabase() {
  db = { medicines, shipments, requests: seedRequests, movements: seedMovements }
  persist()
}
