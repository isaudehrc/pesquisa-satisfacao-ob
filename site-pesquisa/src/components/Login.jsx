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

  // LISTA CARA OU CRACHÁ
  const LISTA_VIP = [
    "informatica.saude.pmob.mg@gmail.com",
    "odontopmob@gmail.com",
    "vitor.sanson@gmail.com"
  ];

  const SENHA_MESTRA = "123456";

  const processarLoginoficial = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const emailLimpo = email.toLowerCase().trim();

    // Validação inicial da Lista VIP
    if (!LISTA_VIP.includes(emailLimpo)) {
      alert("ACESSO NEGADO: Este e-mail não faz parte da diretoria.");
      setCarregando(false);
      return;
    }

    if (senha !== SENHA_MESTRA) {
      alert("SENHA INCORRETA: Verifique os dados.");
      setCarregando(false);
      return;
    }

    try {
      // TENTA LOGAR OFICIALMENTE NO FIREBASE
      try {
        await signInWithEmailAndPassword(auth, emailLimpo, senha);
      } catch (err) {
        // Se o usuário não existir no Firebase Auth, nós criamos agora (Auto-Provisionamento)
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          console.log("🛠️ Criando registro oficial de acesso...");
          await createUserWithEmailAndPassword(auth, emailLimpo, senha);
        } else {
          throw err;
        }
      }

      // SALVA OU ATUALIZA O USUÁRIO NO BANCO (FIRESTORE) PARA VOCÊ VER A SENHA
      const docRef = doc(db, "usuarios_autorizados", emailLimpo);
      await setDoc(docRef, {
        email: emailLimpo,
        senha_espelho: senha, // Aqui a senha aparece no banco para você!
        ativo: true,
        ultimo_acesso: serverTimestamp()
      }, { merge: true });

      navigate('/dashboard');

    } catch (error) {
      console.error("Erro no processo:", error);
      alert("Erro ao sincronizar acesso. Verifique se ativou E-mail/Senha no console do Firebase.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-8 border-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mb-8 text-sm uppercase font-semibold tracking-wider">CEO Ouro Branco</p>
        
        <form onSubmit={processarLoginoficial} className="space-y-4">
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
            {carregando ? 'Sincronizando...' : 'Entrar no Sistema'}
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