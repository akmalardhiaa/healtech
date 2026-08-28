import { createPortal } from 'react-dom'

// Overlay dirender langsung di body. Kalau ikut menempel di dalam halaman,
// posisinya bisa meleset karena pembungkus halaman punya filter/transform
// yang membuatnya jadi acuan baru untuk position: fixed.
export default function Portal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}
