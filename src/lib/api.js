/**
 * Dummy back-end.
 *
 * Every function returns a Promise and resolves after a small random delay so
 * the UI exercises its real loading states. Mutations are persisted to
 * localStorage, which gives the demo continuity across refreshes without a
 * server. Replacing this file with `fetch` calls is the only change needed to
 * go live — the signatures are already API-shaped.
 */
import {
  users,
  medicines,
  shipments,
  requests as seedRequests,
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
    /* corrupted or unavailable storage — fall through to the seed */
  }
  return null
}

function writeStore(db) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db))
  } catch {
    /* private mode / quota — the in-memory copy still works for this session */
  }
}

// Seed once, then reuse whatever the user has changed.
let db = readStore() ?? {
  medicines,
  shipments,
  requests: seedRequests,
}
// Keep the derived catalogue fresh even for a returning visitor: expiry dates
// are relative to load time, so re-seed the read-only fields from mockData.
db.medicines = medicines.map((m) => {
  const saved = db.medicines?.find((s) => s.id === m.id)
  return saved ? { ...m, stock: saved.stock } : m
})

const persist = () => writeStore(db)
const clone = (v) => JSON.parse(JSON.stringify(v))

// --- Auth ------------------------------------------------------------------

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

// --- Reads -----------------------------------------------------------------

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

// --- Mutations -------------------------------------------------------------

export async function decideRequest(id, decision, note = '') {
  await latency(420, 780)
  const req = db.requests.find((r) => r.id === id)
  if (!req) throw new Error(`Permintaan ${id} tidak ditemukan.`)

  req.status = decision // 'approved' | 'rejected'
  req.note = note
  req.decidedAt = 'baru saja'

  // An approved request draws down central stock, which is what makes the
  // dashboard figures move after a decision.
  if (decision === 'approved') {
    const med = db.medicines.find((m) => m.name === req.medicine)
    if (med) med.stock = Math.max(0, med.stock - req.qty)
  }

  persist()
  return clone(req)
}

export async function advanceShipment(id) {
  await latency(300, 560)
  const shp = db.shipments.find((s) => s.id === id)
  if (!shp) throw new Error(`Pengiriman ${id} tidak ditemukan.`)
  shp.stage = Math.min(3, shp.stage + 1)
  if (shp.stage === 3) shp.eta = 'Selesai'
  persist()
  return clone(shp)
}

export async function restock(id, qty) {
  await latency(340, 620)
  const med = db.medicines.find((m) => m.id === id)
  if (!med) throw new Error(`Obat ${id} tidak ditemukan.`)
  med.stock += qty
  persist()
  return clone(med)
}

export function resetDatabase() {
  db = { medicines, shipments, requests: seedRequests }
  persist()
}
