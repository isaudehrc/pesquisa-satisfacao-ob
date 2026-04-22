import React from 'react';
import { auth, provider, db } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  // =================================================================
  // CONFIGURAÇÃO DE INFRAESTRUTURA (A Lista de Ouro)
  // =================================================================
  const LISTA_VIP = [
    "informatica.saude.pmob.mg@gmail.com",
    "odontopmob@gmail.com",
    "vitor.sanson@gmail.com" // Seu e-mail de administrador
  ];

  const fazerLogin = async () => {
    try {
      // 1. Autenticação via Google
      const result = await signInWithPopup(auth, provider);
      const emailLogado = result.user.email;

      console.log("🔒 Tentativa de acesso:", emailLogado);

      // 2. A Mágica do Auto-Provisionamento (O que você pediu)
      // Se o e-mail estiver na nossa Lista de Ouro, garantimos que ele exista no Banco
      if (LISTA_VIP.includes(emailLogado)) {
        const docRef = doc(db, "usuarios_autorizados", emailLogado);
        const docSnap = await getDoc(docRef);

        // Se não existir "pasta" (documento) para ele ainda, o código cria agora!
        if (!docSnap.exists()) {
          console.log("🛠️ Criando registro automático para novo administrador...");
          await setDoc(docRef, {
            email: emailLogado,
            ativo: true,
            permissao: "admin",
            data_cadastro: new Date()
          });
        }

        // Se existir mas estiver desativado por algum motivo, barramos aqui
        if (docSnap.exists() && docSnap.data().ativo === false) {
          await auth.signOut();
          alert("Atenção: Seu acesso foi desativado temporariamente. Contate o suporte.");
          return;
        }

        // Tudo certo! Entra no Dashboard
        navigate('/dashboard');

      } else {
        // Se o e-mail NÃO estiver na Lista de Ouro
        await auth.signOut(); 
        alert(`ACESSO NEGADO!\n\nO e-mail "${emailLogado}" não está na lista de administradores do CEO Ouro Branco.`);
      }

    } catch (error) {
      console.error("Erro detalhado:", error.code);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Erro: Domínio não autorizado. Adicione o link da Vercel no Console do Firebase.");
      } else if (error.code !== 'auth/popup-closed-by-user') {
        alert("Falha no login. Verifique sua conexão ou se o popup foi bloqueado.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-8 border-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mb-8 text-sm uppercase font-semibold tracking-wider">CEO Ouro Branco</p>
        
        <button 
          onClick={fazerLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-900 py-3 px-4 rounded-lg font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all shadow-md mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Entrar com Google
        </button>

        <div className="border-t pt-4">
          <Link to="/" className="text-[10px] text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest transition-colors">
            ← Voltar ao Formulário
          </Link>
        </div>
      </div>
    </div>
  );
}