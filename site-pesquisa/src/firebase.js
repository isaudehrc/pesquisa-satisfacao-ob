// Importamos as ferramentas essenciais do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// NOVO: Importamos o segurança (Auth) e o porteiro do Google
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// A sua Chave Mestra do Projeto CEO-OB (Mantendo suas chaves originais)
const firebaseConfig = {
  apiKey: "AIzaSyDqgzNa32e3H1eXwrsrLC9g2ZxCnHZKAkg",
  authDomain: "pesquisa-ceo-ob.firebaseapp.com",
  projectId: "pesquisa-ceo-ob",
  storageBucket: "pesquisa-ceo-ob.firebasestorage.app",
  messagingSenderId: "456555172876",
  appId: "1:456555172876:web:1acbc74c874e54a45e4a29"
};

// Inicializamos o Firebase
const app = initializeApp(firebaseConfig);

// Exportamos o Banco de Dados
export const db = getFirestore(app);

// NOVO: Exportamos a Autenticação e o Provedor Google para o resto do site usar
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();