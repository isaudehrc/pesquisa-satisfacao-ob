import React, { useState } from 'react';
import { db, auth } from '../firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const LISTA_VIP = [
    "informatica.saude.pmob.mg@gmail.com",
    "odontopmob@gmail.com",
    "vitor.sanson@gmail.com"
  ];

  const SENHA_MESTRA = "123456";

  const realizarLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const emailLimpo = email.toLowerCase().trim();

    // 1. Verificação da Lista VIP
    if (!LISTA_VIP.includes(emailLimpo)) {
      alert("ACESSO NEGADO: Este e-mail não está na lista de administradores.");
      setCarregando(false);
      return;
    }

    // 2. Verificação da Senha no formulário
    if (senha !== SENHA_MESTRA) {
      alert("SENHA INCORRETA: Utilize a senha padrão definida.");
      setCarregando(false);
      return;
    }

    try {
      // 3. Tentativa de Login ou Criação Automática
      try {
        await signInWithEmailAndPassword(auth, emailLimpo, senha);
        console.log("🔓 Login realizado com sucesso.");
      } catch (err) {
        // Se der erro (conta nova), nós criamos ela no motor oficial agora
        console.log("🛠️ Criando nova credencial oficial no Firebase...");
        await createUserWithEmailAndPassword(auth, emailLimpo, senha);
      }

      // 4. Gravação no Firestore (Onde a senha vai aparecer para você)
      const docRef = doc(db, "usuarios_autorizados", emailLimpo);
      await setDoc(docRef, {
        email: emailLimpo,
        senha_espelho: senha, // Agora ela vai aparecer no seu banco!
        ativo: true,
        data_registro: serverTimestamp()
      }, { merge: true });

      navigate('/dashboard');

    } catch (error) {
      console.error("Erro no processo:", error.code);
      alert("Erro ao sincronizar. Verifique se ativou 'E-mail/Senha' no Console do Firebase.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-8 border-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mb-8 text-sm uppercase font-semibold tracking-wider">CEO Ouro Branco</p>
        
        <form onSubmit={realizarLogin} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">E-mail</label>
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
            disabled={carregando}
            className={`w-full bg-gray-900 text-white py-4 px-4 rounded-lg font-bold hover:bg-black transition-all shadow-lg text-[11px] uppercase tracking-[0.2em] mt-2 ${carregando ? 'opacity-50' : ''}`}
          >
            {carregando ? 'Acessando...' : 'Entrar no Sistema'}
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