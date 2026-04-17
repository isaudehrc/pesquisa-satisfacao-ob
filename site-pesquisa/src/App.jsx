import React, { useState } from 'react';
import { Cabecalho } from './components/Cabecalho';
import { DadosGerais } from './components/DadosGerais';
import { AvaliacaoEquipe } from './components/AvaliacaoEquipe';
import { TratamentoEAvaliacao } from './components/TratamentoEAvaliacao';
import { SugestoesEAssinatura } from './components/SugestoesEAssinatura';

import marcaDagua from './assets/marca_dagua.png';

// Conexão com o Firebase
import { db } from './firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

function App() {
  const [enviando, setEnviando] = useState(false);
  const [camposComErro, setCamposComErro] = useState([]); 
  
  // NOVO: A nossa chave mágica de reset
  const [chaveReset, setChaveReset] = useState(0);

  // NOVO: A função que o botão Limpar vai chamar
  const handleLimpar = () => {
    setCamposComErro([]); // Limpa a lista de erros vermelhos
    setChaveReset(valorAntigo => valorAntigo + 1); // Força o React a recriar o formulário do zero (apagando as estrelas)
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // --- 🛑 GUARITA DE INSPEÇÃO ---
    const errosEncontrados = [];
    
    const camposObrigatorios = [
      'dataNascimento', 'sexo', 'municipio', 
      'cordialidade', 'clareza', 'acesso', 'tempo', 'ambiente', 
      'atendimento_necessidades', 'compreensao_orientacoes' 
    ];

    camposObrigatorios.forEach(campo => {
      if (!data[campo] || data[campo].trim() === '') {
        errosEncontrados.push(campo);
      }
    });

    if (!data['satisfacao_geral_estrelas'] || data['satisfacao_geral_estrelas'] === '0') {
      errosEncontrados.push('satisfacao_geral_estrelas');
    }

    if (errosEncontrados.length > 0) {
      setCamposComErro(errosEncontrados); 
      alert("Atenção: Algumas perguntas obrigatórias não foram respondidas. Por favor, verifique o formulário.");
      return; 
    }

    setCamposComErro([]);
    setEnviando(true);

    try {
      // --- 🚀 ENVIO PARA O FIREBASE ---
      const colecaoFichas = collection(db, 'fichas_avaliacao');
      await addDoc(colecaoFichas, {
        ...data,
        data_envio: serverTimestamp() 
      });

      alert("Avaliação enviada com sucesso! Muito obrigado.");
      handleLimpar(); // Usamos a nossa função mágica aqui também para limpar tudo após o envio!

    } catch (error) {
      console.error("Erro ao enviar a avaliação: ", error);
      alert("Ops! Houve um problema ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4 flex justify-center font-sans text-[15px]">
      <div className="bg-white max-w-3xl w-full p-10 md:p-14 shadow-xl border border-gray-300 relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.15] w-[95%] sm:w-[90%] flex justify-center items-center">
          <img src={marcaDagua} alt="" className="w-full h-auto object-contain" />
        </div>

        {/* Colocamos a chave mágica aqui na tag form. Quando ela muda, tudo aqui dentro reseta! */}
        <form key={chaveReset} className="relative z-10" onSubmit={handleSubmit} onReset={handleLimpar}>
          <Cabecalho />
          <DadosGerais erros={camposComErro} />
          <AvaliacaoEquipe erros={camposComErro} />
          <TratamentoEAvaliacao erros={camposComErro} />
          <SugestoesEAssinatura />

          <div className="mt-12 flex justify-end gap-4">
            <button 
              type="reset" 
              className="text-gray-500 hover:text-red-600 font-medium px-4 transition duration-150 text-sm uppercase tracking-wider"
              disabled={enviando}
            >
              Limpar
            </button>

            <button 
              type="submit" 
              className="bg-gray-900 text-white font-bold py-3 px-12 rounded-lg hover:bg-gray-700 transition duration-150 uppercase text-sm tracking-wider shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={enviando} 
            >
              {enviando ? "Enviando..." : "Enviar"} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;