import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './ThemeContext.tsx'
import { Footer } from './Footer.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <React.StrictMode>
      <App />
      <Footer />
    </React.StrictMode>
  </ThemeProvider>
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
