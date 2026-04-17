import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.jsx'
import { Login } from './components/Login.jsx'
// IMPORTAÇÃO NOVA: Chamando o Dashboard real
import { Dashboard } from './components/Dashboard.jsx' 
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import './index.css'

// COMPONENTE DE ROTA PROTEGIDA (O seu "Guarda de Trânsito")
const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center text-xl">Verificando credenciais...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

// CONFIGURAÇÃO DAS ROTAS
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { 
    path: "/dashboard", 
    // AGORA USA O COMPONENTE DASHBOARD REAL
    element: <PrivateRoute><Dashboard /></PrivateRoute> 
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)