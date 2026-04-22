import React, { useState } from 'react';
import { db } from '../firebase'; // Importamos o banco de dados
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Ferramentas de escrita/leitura
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // =================================================================
  // CONFIGURAÇÃO DOS ACESSOS PERMITIDOS (Cara ou Crachá)
  // =================================================================
  const LISTA_VIP = [
    "informatica.saude.pmob.mg@gmail.com",
    "odontopmob@gmail.com",
    "vitor.sanson@gmail.com"
  ];

  const SENHA_MESTRA = "123456";

  const realizarLoginManual = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const emailLimpo = email.toLowerCase().trim();

    try {
      // 1. Validação de Credenciais no Código
      if (LISTA_VIP.includes(emailLimpo) && senha === SENHA_MESTRA) {
        
        console.log("✅ Credenciais validadas. Verificando banco de dados...");

        // 2. Lógica de "Criação Automática" no Banco de Dados
        // Vamos verificar se esse usuário já tem uma "pasta" na coleção usuarios_autorizados
        const docRef = doc(db, "usuarios_autorizados", emailLimpo);
        const docSnap = await getDoc(docRef);

        // Se não existir a lista no Google ainda, o código cria ela AGORA:
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            email: emailLimpo,
            ativo: true,
            ultimo_acesso: new Date(),
            setor: emailLimpo.includes('informatica') ? 'TI' : 'Odontologia'
          });
          console.log("🛠️ Lista de autenticação criada automaticamente no Firestore!");
        } else {
          // Se já existir, apenas atualizamos o horário do último acesso
          await setDoc(docRef, { ultimo_acesso: new Date() }, { merge: true });
        }

        // 3. Salva a sessão localmente e entra no Dashboard
        localStorage.setItem('usuario_logado', emailLimpo);
        navigate('/dashboard');

      } else {
        alert("ACESSO NEGADO!\nE-mail ou senha incorretos.");
      }
    } catch (error) {
      console.error("Erro ao processar login:", error);
      alert("Erro de conexão com o Banco de Dados. Verifique sua internet.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-8 border-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mb-8 text-sm uppercase font-semibold tracking-wider">CEO Ouro Branco</p>
        
        <form onSubmit={realizarLoginManual} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">E-mail Corporativo</label>
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
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Senha de Acesso</label>
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
            disabled={carregando}
            className={`w-full bg-gray-900 text-white py-4 px-4 rounded-lg font-bold hover:bg-black transition-all shadow-lg text-[11px] uppercase tracking-[0.2em] mt-2 ${carregando ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
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