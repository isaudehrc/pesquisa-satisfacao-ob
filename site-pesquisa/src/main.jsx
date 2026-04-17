import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Importamos o guarda de trânsito (React Router)
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Importamos as nossas duas páginas
import App from './App.jsx'
import { Dashboard } from './components/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Porta 1: O formulário do paciente (Caminho padrão) */}
        <Route path="/" element={<App />} />
        
        {/* Porta 2: O painel da gestão (Caminho secreto) */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)