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
  const [chaveReset, setChaveReset] = useState(0);

  const handleLimpar = () => {
    setCamposComErro([]);
    setChaveReset(prev => prev + 1);
  };

  const enviarParaFirebase = async (dadosFinais) => {
    setEnviando(true);
    
    // --- LIMPEZA DO MUNICÍPIO ---
    const regexInvalido = /[^a-zA-ZÀ-ÿ\s-]/; 
    let municipioLimpo = dadosFinais.municipio ? dadosFinais.municipio.trim() : "";
    
    if (municipioLimpo === "" || regexInvalido.test(municipioLimpo)) {
      municipioLimpo = "Não informado";
    }

    const dadosTratados = {
      ...dadosFinais,
      municipio: municipioLimpo
    };

    try {
      const colecaoFichas = collection(db, 'fichas_avaliacao');
      await addDoc(colecaoFichas, {
        ...dadosTratados,
        data_envio: serverTimestamp() 
      });
      alert("Avaliação enviada com sucesso! Muito obrigado pela sua participação.");
      handleLimpar();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Ops! Houve um problema ao enviar a avaliação.");
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const erros = [];
    
    // ATUALIZADO: Nova lista de campos obrigatórios com as Seções A, B e C (Padrão LGPD)
    const obrigatorios = [
      'respondente', 'faixaEtaria', 'municipio', 'consentimento_lgpd', 
      'cordialidade', 'clareza', 'tempo', 'contato', 'horario', 'limpeza', 'acessibilidade', 
      'atendimento_necessidades', 'compreensao_orientacoes',
      'recomendacao_nps' 
    ];

    obrigatorios.forEach(campo => {
      if (data[campo] === undefined || data[campo] === null || data[campo].toString().trim() === '') {
        erros.push(campo);
      }
    });

    // VALIDAÇÃO DAS ESTRELAS (1-5)
    if (!data['satisfacao_geral_estrelas'] || data['satisfacao_geral_estrelas'] === '0') {
      erros.push('satisfacao_geral_estrelas');
    }

    if (erros.length > 0) {
      setCamposComErro(erros);
      alert("Atenção: Algumas perguntas obrigatórias não foram respondidas.");
      return;
    }

    // Como o form já é anônimo e validado, enviamos direto!
    enviarParaFirebase(data);
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4 flex justify-center font-sans text-[15px]">
      <div className="bg-white max-w-3xl w-full p-10 md:p-14 shadow-xl border border-gray-300 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.15] w-[95%] sm:w-[90%] flex justify-center items-center">
          <img src={marcaDagua} alt="" className="w-full h-auto object-contain" />
        </div>

        <form key={chaveReset} className="relative z-10" onSubmit={handleSubmit} onReset={handleLimpar}>
          <Cabecalho />
          <DadosGerais erros={camposComErro} />
          <AvaliacaoEquipe erros={camposComErro} />
          <TratamentoEAvaliacao erros={camposComErro} />
          <SugestoesEAssinatura />

          <div className="mt-12 flex justify-end gap-4">
            <button type="reset" className="text-gray-500 hover:text-red-600 font-medium px-4 text-sm uppercase" disabled={enviando}>
              Limpar
            </button>
            <button type="submit" className="bg-gray-900 text-white font-bold py-3 px-12 rounded-lg hover:bg-gray-700 uppercase text-sm shadow-md" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar"} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;