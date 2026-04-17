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
  
  // NOVO ESTADO: Guarda a lista de quais campos o usuário esqueceu
  const [camposComErro, setCamposComErro] = useState([]); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // --- 🛑 GUARITA DE INSPEÇÃO (Validação Obrigatória) ---
    const errosEncontrados = [];
    
    // Lista de todas as perguntas que NÃO podem ficar em branco
    const camposObrigatorios = [
      'dataNascimento', 'sexo', 'municipio', // Seção 1
      'cordialidade', 'clareza', 'acesso', 'tempo', 'ambiente', // Seção 2
      'atendimento_necessidades', 'compreensao_orientacoes' // Seção 3
    ];

    // Varre a lista verificando se algo está vazio ou se a bolinha não foi marcada
    camposObrigatorios.forEach(campo => {
      if (!data[campo] || data[campo].trim() === '') {
        errosEncontrados.push(campo);
      }
    });

    // Regra Especial para as Estrelas (o input escondido manda '0' se não clicado)
    if (!data['satisfacao_geral_estrelas'] || data['satisfacao_geral_estrelas'] === '0') {
      errosEncontrados.push('satisfacao_geral_estrelas');
    }

    // Se a guarita encontrou qualquer erro, TRAVA O ENVIO!
    if (errosEncontrados.length > 0) {
      setCamposComErro(errosEncontrados); // Salva a lista de erros para pintar de vermelho depois
      alert("Atenção: Algumas perguntas obrigatórias não foram respondidas. Por favor, verifique o formulário.");
      return; // O 'return' expulsa o código daqui e impede de chegar no Firebase
    }

    // Se passou na guarita, limpa os erros antigos e segue o jogo
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
      form.reset(); 
      setCamposComErro([]); // Limpa os erros visuais se houver

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

        <form className="relative z-10" onSubmit={handleSubmit}>
          <Cabecalho />
          
          {/* Passamos a lista 'camposComErro' para os componentes saberem o que destacar */}
          <DadosGerais erros={camposComErro} />
          <AvaliacaoEquipe erros={camposComErro} />
          <TratamentoEAvaliacao erros={camposComErro} />
          
          {/* Sugestões continua livre de erros, pois é opcional */}
          <SugestoesEAssinatura />

          <div className="mt-12 flex justify-end gap-4">
            <button 
              type="reset" 
              className="text-gray-500 hover:text-red-600 font-medium px-4 transition duration-150 text-sm uppercase tracking-wider"
              disabled={enviando}
              onClick={() => setCamposComErro([])} // Limpa os destaques vermelhos ao clicar em Limpar
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