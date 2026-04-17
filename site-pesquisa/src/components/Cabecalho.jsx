import React from 'react';
// Importamos a imagem da logo
import brasaoOuroBranco from '../assets/brasao_ouro_branco.png';

export function Cabecalho() {
  return (
    <div className="mb-8 border-b-2 border-gray-800 pb-4 relative z-10">
      <div className="flex justify-between items-center mb-6">
        
        {/* Lado Esquerdo - Logo Completa da Prefeitura */}
        <div className="flex-shrink-0">
          <img 
            src={brasaoOuroBranco} 
            alt="Logo da Prefeitura de Ouro Branco" 
            className="h-24 object-contain"
          />
        </div>

        {/* Lado Direito - Textos da Secretaria */}
        <div className="text-right text-sm text-gray-700">
          <p>Prefeitura Municipal de Ouro Branco</p>
          <p>Estado de Minas Gerais</p>
          <p>Secretaria Municipal de Saúde</p>
        </div>
      </div>

      <div className="text-center mt-8 relative z-10">
        {/* Título Atualizado: Adicionando a palavra SUS ao final */}
        <h2 className="text-xl font-bold uppercase mb-2">Pesquisa de Satisfação dos Usuários do SUS</h2>
        <h3 className="text-md font-bold text-gray-800">Avaliação de Satisfação do Usuário – Tratamento Odontológico no CEO - OB</h3>
      </div>
      
      <div className="mt-6 text-sm text-gray-800 text-justify relative z-10">
        <p className="mb-2 font-bold">Prezado(a) usuário(a),</p>
        <p>
          Sua opinião é muito importante para aprimorarmos a qualidade do atendimento prestado no Centro de
          Especialidades Odontológicas (CEO) de Ouro Branco. Pedimos alguns minutos para responder esta avaliação.
          Suas respostas são confidenciais.
        </p>
      </div>
    </div>
  );
}