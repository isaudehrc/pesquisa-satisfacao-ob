import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom'; // Ferramentas de navegação

export function Login() {
  const navigate = useNavigate();

  const fazerLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // SUCESSO: O GPS te leva direto para o Dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro ao logar:", error);
      alert("Falha no login. Verifique se a janela do Google abriu corretamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-8 border-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Área Administrativa</h2>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          Acesse para visualizar os resultados das pesquisas.
        </p>
        
        <button 
          onClick={fazerLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>

        <div className="border-t pt-4">
          <Link to="/" className="text-xs text-blue-600 hover:underline font-medium uppercase tracking-widest">
            ← Voltar para o Formulário
          </Link>
        </div>
      </div>
    </div>
  );
}