import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.jsx'
import { Login } from './components/Login.jsx'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import './index.css'

// O Dashboard ainda é um "placeholder" até criarmos ele na próxima sprint
const DashboardTemporario = () => (
  <div className="p-10">
    <h1 className="text-2xl font-bold">Dashboard em Construção...</h1>
    <p>Se você está vendo isso, o Login funcionou!</p>
    <button onClick={() => auth.signOut()} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Sair</button>
  </div>
);

// COMPONENTE DE ROTA PROTEGIDA
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
  
  // Se não estiver logado, manda para a página de Login
  return user ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { 
    path: "/dashboard", 
    element: <PrivateRoute><DashboardTemporario /></PrivateRoute> 
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)