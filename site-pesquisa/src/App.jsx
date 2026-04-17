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

  // ESTADOS PARA O MODO ANÔNIMO
  const [mostrarModalAnonimo, setMostrarModalAnonimo] = useState(false);
  const [dadosTemporarios, setDadosTemporarios] = useState(null);

  // Função para resetar o formulário completamente
  const handleLimpar = () => {
    setCamposComErro([]);
    setChaveReset(prev => prev + 1);
  };

  // Função que realmente grava no Banco de Dados
  const enviarParaFirebase = async (dadosFinais) => {
    setEnviando(true);
    try {
      const colecaoFichas = collection(db, 'fichas_avaliacao');
      await addDoc(colecaoFichas, {
        ...dadosFinais,
        data_envio: serverTimestamp() 
      });
      alert("Avaliação enviada com sucesso! Muito obrigado.");
      handleLimpar();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Ops! Houve um problema ao enviar. Verifique sua conexão.");
    } finally {
      setEnviando(false);
      setMostrarModalAnonimo(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // 1. GUARITA DE INSPEÇÃO: CAMPOS OBRIGATÓRIOS (BOLINHAS E ESTRELAS)
    const erros = [];
    const obrigatorios = [
      'dataNascimento', 'sexo', 'municipio', 
      'cordialidade', 'clareza', 'acesso', 'tempo', 'ambiente', 
      'atendimento_necessidades', 'compreensao_orientacoes' 
    ];

    obrigatorios.forEach(campo => {
      if (!data[campo] || data[campo].trim() === '') {
        erros.push(campo);
      }
    });

    if (!data['satisfacao_geral_estrelas'] || data['satisfacao_geral_estrelas'] === '0') {
      erros.push('satisfacao_geral_estrelas');
    }

    // Se faltar alguma bolinha ou estrela, para aqui e pinta de vermelho
    if (erros.length > 0) {
      setCamposComErro(erros);
      alert("Atenção: Algumas perguntas obrigatórias não foram respondidas. Verifique os campos em vermelho.");
      return;
    }

    // 2. VALIDAÇÃO DO NOME / MODO ANÔNIMO
    const nomeInformado = data.nome ? data.nome.trim() : "";
    const regexNomeInvalido = /[^a-zA-ZÀ-ÿ\s-]/; // Detecta números ou símbolos

    // Se o nome estiver vazio OU for inválido, abre o Modal
    if (nomeInformado === "" || regexNomeInvalido.test(nomeInformado)) {
      setDadosTemporarios(data);
      setMostrarModalAnonimo(true);
    } else {
      // Se o nome estiver OK, envia direto
      enviarParaFirebase(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4 flex justify-center font-sans text-[15px]">
      <div className="bg-white max-w-3xl w-full p-10 md:p-14 shadow-xl border border-gray-300 relative overflow-hidden">
        
        {/* Marca d'água de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.15] w-[95%] sm:w-[90%] flex justify-center items-center">
          <img src={marcaDagua} alt="" className="w-full h-auto object-contain" />
        </div>

        {/* Formulário com chave de reset para limpar as estrelas */}
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

        {/* MODAL DE IDENTIFICAÇÃO (ANÔNIMO) */}
        {mostrarModalAnonimo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-7 rounded-lg max-w-sm w-full shadow-2xl border-t-4 border-gray-900 text-center">
              <h4 className="font-bold text-xl mb-3 text-gray-900">Identificação</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Não identificamos um **Nome** válido. Deseja enviar sua avaliação de forma anônima?
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setMostrarModalAnonimo(false)}
                  className="px-4 py-2 text-gray-400 font-bold hover:text-black transition-colors uppercase text-xs tracking-widest"
                >
                  Voltar
                </button>
                <button 
                  onClick={() => enviarParaFirebase({ ...dadosTemporarios, nome: "Anônimo" })}
                  className="px-6 py-3 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-800 transition-all uppercase text-xs tracking-widest shadow-lg"
                >
                  Sim, Anônimo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// O INTERRUPTOR PRINCIPAL QUE ESTAVA FALTANDO:
export default App;