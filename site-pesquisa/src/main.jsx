import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.jsx'
import { Login } from './components/Login.jsx'
import { Dashboard } from './components/Dashboard.jsx' 
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import './index.css'

// 1. TELA DE ERRO AMIGÁVEL (Trata o erro 'removeChild' e outros)
const ErrorBoundary = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full text-center border-t-8 border-red-600">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
        <p className="text-gray-500 mb-6 text-sm">Ocorreu um erro de exibição no navegador.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-900 text-white px-6 py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-gray-700 transition-colors"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  );
};

// 2. COMPONENTE DE ROTA PROTEGIDA
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

  if (loading) return <div className="p-10 text-center text-xl font-medium text-gray-500">Verificando credenciais...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

// 3. CONFIGURAÇÃO DAS ROTAS (Agora blindadas com o ErrorBoundary)
const router = createBrowserRouter([
  { 
    path: "/", 
    element: <App />,
    errorElement: <ErrorBoundary /> 
  },
  { 
    path: "/login", 
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  { 
    path: "/dashboard", 
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
    errorElement: <ErrorBoundary />
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)