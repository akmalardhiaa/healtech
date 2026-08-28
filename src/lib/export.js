// Ekspor CSV. Pakai titik koma sebagai pemisah karena Excel versi Indonesia
// membaca koma sebagai desimal, kalau pakai koma kolomnya jadi berantakan.
const escape = (v) => {
  const s = String(v ?? '')
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(columns, rows) {
  const head = columns.map((c) => escape(c.label)).join(';')
  const body = rows.map((r) => columns.map((c) => escape(c.value(r))).join(';'))
  return [head, ...body].join('\r\n')
}

export function downloadCSV(filename, csv) {
  // BOM supaya huruf beraksen tidak rusak saat dibuka di Excel
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const stamp = () =>
  new Date().toISOString().slice(0, 10).replace(/-/g, '')
