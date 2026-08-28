import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { LangProvider } from '@/store/LangContext'
import { ToastProvider } from '@/components/Toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LangProvider>
        <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
        </ThemeProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
