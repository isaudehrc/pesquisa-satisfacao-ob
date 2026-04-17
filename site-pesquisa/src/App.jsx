import React, { useState } from 'react'; // Adicionado o useState para controlar a tela de "Carregando"
import { Cabecalho } from './components/Cabecalho';
import { DadosGerais } from './components/DadosGerais';
import { AvaliacaoEquipe } from './components/AvaliacaoEquipe';
import { TratamentoEAvaliacao } from './components/TratamentoEAvaliacao';
import { SugestoesEAssinatura } from './components/SugestoesEAssinatura';

import marcaDagua from './assets/marca_dagua.png';

// --- A MÁGICA DO BANCO DE DADOS COMEÇA AQUI ---
// Importamos a conexão com o banco que você criou no firebase.js
import { db } from './firebase'; 
// Importamos a função de "adicionar documento" (fichas) do Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

function App() {
  // Estado para controlar o botão de enviar (evitar cliques duplos)
  const [enviando, setEnviando] = useState(false);

  // Esta é a função que o botão "Enviar" vai chamar
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede a página de recarregar
    setEnviando(true);  // Muda o botão para "Enviando..."

    try {
      // 1. Pegamos todos os dados que o usuário preencheu no formulário (a "Ficha")
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // 2. Damos o endereço de entrega: a pasta "fichas_avaliacao" lá no nosso banco de dados
      const colecaoFichas = collection(db, 'fichas_avaliacao');

      // 3. Empacotamos tudo e jogamos na nuvem! (O addDoc faz esse envio)
      // O serverTimestamp registra a hora exata lá no servidor do Google
      await addDoc(colecaoFichas, {
        ...data,
        data_envio: serverTimestamp() 
      });

      // 4. Se deu tudo certo, avisamos o paciente e limpamos a ficha
      alert("Avaliação enviada com sucesso! Muito obrigado.");
      form.reset(); // Limpa os campos da tela

    } catch (error) {
      // Se der algum erro (falta de internet, por exemplo), avisamos o usuário
      console.error("Erro ao enviar a avaliação: ", error);
      alert("Ops! Houve um problema ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      // 5. Devolvemos o botão ao estado normal
      setEnviando(false);
    }
  };

  return (
    // Aplicamos text-[15px] para aumentar a fonte em ~1 ponto de forma global e discreta
    <div className="min-h-screen bg-gray-200 py-10 px-4 flex justify-center font-sans text-[15px]">
      <div className="bg-white max-w-3xl w-full p-10 md:p-14 shadow-xl border border-gray-300 relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.15] w-[95%] sm:w-[90%] flex justify-center items-center">
          <img src={marcaDagua} alt="" className="w-full h-auto object-contain" />
        </div>

        {/* --- LIGAMOS A NOSSA FUNÇÃO MÁGICA AQUI NO onSubmit --- */}
        <form className="relative z-10" onSubmit={handleSubmit}>
          <Cabecalho />
          <DadosGerais />
          <AvaliacaoEquipe />
          <TratamentoEAvaliacao />
          <SugestoesEAssinatura />

          {/* Área de Botões Revisitada */}
          <div className="mt-12 flex justify-end gap-4">
            {/* Botão Limpar */}
            <button 
              type="reset" 
              className="text-gray-500 hover:text-red-600 font-medium px-4 transition duration-150 text-sm uppercase tracking-wider"
              disabled={enviando} // Desativa se estiver enviando
            >
              Limpar
            </button>

            {/* Botão principal simplificado para "Enviar" */}
            <button 
              type="submit" 
              className="bg-gray-900 text-white font-bold py-3 px-12 rounded-lg hover:bg-gray-700 transition duration-150 uppercase text-sm tracking-wider shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={enviando} // Desativa o botão para evitar envio duplo
            >
              {/* O texto do botão muda se estiver processando */}
              {enviando ? "Enviando..." : "Enviar"} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;