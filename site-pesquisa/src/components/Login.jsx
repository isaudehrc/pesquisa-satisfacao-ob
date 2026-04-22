import React from 'react';
// IMPORTANTE: Adicionamos o 'db' (banco de dados) na importação do firebase
import { auth, provider, db } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';
// IMPORTANTE: Adicionamos as ferramentas para ler o banco de dados
import { doc, getDoc } from 'firebase/firestore'; 
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const fazerLogin = async () => {
    try {
      // =================================================================
      // PASSO 1: AUTENTICAÇÃO (O Google confirma quem a pessoa é)
      // =================================================================
      const result = await signInWithPopup(auth, provider);
      
      // Aqui está a variável super evidenciada recebendo o e-mail:
      const emailTentandoAcesso = result.user.email;
      
      console.log("Detectamos um login do e-mail:", emailTentandoAcesso);

      // =================================================================
      // PASSO 2: BUSCA DO CRACHÁ (Procurar o e-mail no Banco de Dados)
      // =================================================================
      // Vamos na coleção "usuarios_autorizados" procurar um documento que tenha o exato nome do e-mail
      const referenciaDoCracha = doc(db, 'usuarios_autorizados', emailTentandoAcesso);
      const crachaEncontrado = await getDoc(referenciaDoCracha);

      // =================================================================
      // PASSO 3: O GRANDE TESTE (A Autorização)
      // =================================================================
      if (crachaEncontrado.exists() && crachaEncontrado.data().ativo === true) {
        
        // SUCESSO: Tem o crachá e está ativo!
        console.log("Acesso Liberado para:", emailTentandoAcesso);
        navigate('/dashboard');
        
      } else {
        
        // FALHA: E-mail não está na lista ou foi desativado (ativo = false)
        // Ação imediata: Derrubar a sessão do Google para proteger o sistema
        await auth.signOut(); 
        
        // Alerta elegante e claro para o usuário:
        alert(`ACESSO NEGADO!\n\nO e-mail "${emailTentandoAcesso}" não possui autorização para acessar o painel do CEO.\n\nSolicite a liberação ao administrador do sistema.`);
      }

    } catch (error) {
      console.error("Erro detalhado:", error.code);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Erro: Domínio não autorizado no Firebase. Adicione o link da Vercel no Console do Firebase.");
      } else if (error.code !== 'auth/popup-closed-by-user') {
        // Ignora o erro se o usuário apenas fechar a janelinha do Google de propósito
        alert("Falha no login. Verifique se o popup não foi bloqueado pelo navegador.");
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
          {/* SVG do Google embutido para nunca falhar o ícone */}
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