import React from 'react';
import { Cabecalho } from './components/Cabecalho';
import { DadosGerais } from './components/DadosGerais';
import { AvaliacaoEquipe } from './components/AvaliacaoEquipe';
import { TratamentoEAvaliacao } from './components/TratamentoEAvaliacao';
import { SugestoesEAssinatura } from './components/SugestoesEAssinatura';

import marcaDagua from './assets/marca_dagua.png'; 

function App() {
  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4 flex justify-center font-sans">
      <div className="bg-white max-w-3xl w-full p-10 md:p-14 shadow-xl border border-gray-300 relative overflow-hidden">
        
        {/* Aumentamos a opacidade para 0.15 (15%) para o meio termo perfeito */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.15] w-[95%] sm:w-[90%] flex justify-center items-center">
          <img src={marcaDagua} alt="" className="w-full h-auto object-contain" />
        </div>

        <form className="relative z-10" onSubmit={(e) => {e.preventDefault(); alert("Formulário completo! Em breve conectaremos ao banco de dados.");}}>
          <Cabecalho />
          <DadosGerais />
          <AvaliacaoEquipe />
          <TratamentoEAvaliacao />
          <SugestoesEAssinatura />

          <div className="mt-12 flex justify-end">
            <button 
              type="submit" 
              className="bg-gray-900 text-white font-bold py-3 px-10 rounded-lg hover:bg-gray-700 transition duration-150 uppercase text-sm tracking-wider shadow-md"
            >
              Enviar Pesquisa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;