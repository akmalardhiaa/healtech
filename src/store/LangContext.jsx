import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import id from '@/i18n/id'
import en from '@/i18n/en'

const kamus = { id, en }
const KEY = 'vitalstock:lang'

const LangCtx = createContext(null)
export const useLang = () => useContext(LangCtx)

// ambil nilai lewat jalur bertitik, mis. 'stok.judul'
const ambil = (obj, jalur) => jalur.split('.').reduce((o, k) => o?.[k], obj)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const simpan = localStorage.getItem(KEY)
      if (simpan === 'id' || simpan === 'en') return simpan
      return navigator.language?.startsWith('en') ? 'en' : 'id'
    } catch {
      return 'id'
    }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(KEY, lang)
    } catch {
      // abaikan
    }
  }, [lang])

  const value = useMemo(() => {
    const t = (jalur, vars) => {
      // kalau kunci belum ada di bahasa aktif, pakai bahasa Indonesia
      const teks = ambil(kamus[lang], jalur) ?? ambil(kamus.id, jalur) ?? jalur
      if (!vars || typeof teks !== 'string') return teks
      return teks.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
    }

    // untuk istilah yang datang dari data contoh, bukan dari UI
    const td = (grup, nilai) => ambil(kamus[lang], `data.${grup}`)?.[nilai] ?? nilai

    return {
      lang,
      setLang,
      t,
      td,
      locale: lang === 'en' ? 'en-GB' : 'id-ID',
      toggle: () => setLang((l) => (l === 'id' ? 'en' : 'id')),
    }
  }, [lang])

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}
