import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  // =================================================================
  // CONFIGURAÇÃO DE ACESSO (O seu "Cara ou Crachá" manual)
  // =================================================================
  const LISTA_VIP = [
    "informatica.saude.pmob.mg@gmail.com",
    "odontopmob@gmail.com",
    "vitor.sanson@gmail.com"
  ];

  const SENHA_PADRAO = "123456";

  const lidarComLogin = (e) => {
    e.preventDefault();

    console.log("🔒 Tentativa de acesso manual:", email);

    // Validação direta no código: Verifica se o e-mail está na lista e se a senha confere
    if (LISTA_VIP.includes(email.toLowerCase().trim()) && senha === SENHA_PADRAO) {
      
      console.log("✅ Acesso concedido!");
      // Armazenamos uma flag simples para o navegador saber que houve login
      localStorage.setItem('autenticado', 'true');
      navigate('/dashboard');

    } else {
      // Mensagem de erro caso os dados não batam
      alert("ACESSO NEGADO!\n\nUsuário não autorizado ou senha incorreta.\nVerifique os dados com o administrador.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-8 border-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mb-8 text-sm uppercase font-semibold tracking-wider">CEO Ouro Branco</p>
        
        <form onSubmit={lidarComLogin} className="space-y-5">
          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">E-mail de Acesso</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-gray-900 outline-none transition-all text-sm font-medium"
              placeholder="exemplo@gmail.com"
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Senha</label>
            <input 
              type="password" 
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-gray-900 outline-none transition-all text-sm font-medium"
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gray-900 text-white py-4 px-4 rounded-lg font-bold hover:bg-black transition-all shadow-lg text-[11px] uppercase tracking-[0.2em] mt-2"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="border-t pt-6 mt-6">
          <Link to="/" className="text-[10px] text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest transition-colors">
            ← Voltar ao Formulário
          </Link>
        </div>
      </div>
    </div>
  );
}