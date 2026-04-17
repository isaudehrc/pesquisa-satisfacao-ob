// Importamos as ferramentas essenciais do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Esta é a ferramenta do Banco de Dados!

// A sua Chave Mestra do Projeto CEO-OB
const firebaseConfig = {
  apiKey: "AIzaSyDqgzNa32e3H1eXwrsrLC9g2ZxCnHZKAkg",
  authDomain: "pesquisa-ceo-ob.firebaseapp.com",
  projectId: "pesquisa-ceo-ob",
  storageBucket: "pesquisa-ceo-ob.firebasestorage.app",
  messagingSenderId: "456555172876",
  appId: "1:456555172876:web:1acbc74c874e54a45e4a29"
};

// Inicializamos o Firebase e o Banco de Dados (Firestore)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);