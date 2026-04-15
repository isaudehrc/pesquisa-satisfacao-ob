import React from 'react';

export function TratamentoEAvaliacao() {
  return (
    <div className="mb-8">
      
      {/* Seção 2: Sobre o Tratamento Realizado */}
      <div className="mb-6 border-t border-gray-300 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">2. Sobre o Tratamento Realizado</h3>
        
        {/* Pergunta 1 da Seção 2 */}
        <div className="mb-4 pl-4">
          <p className="text-sm font-bold text-gray-800 mb-2">O tratamento odontológico que você recebeu:</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="totalmente" className="w-4 h-4 accent-black" />
              Atendeu totalmente às suas necessidades
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="parcialmente" className="w-4 h-4 accent-black" />
              Atendeu parcialmente
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="nao_atendeu" className="w-4 h-4 accent-black" />
              Não atendeu
            </label>
          </div>
        </div>

        {/* Pergunta 2 da Seção 2 */}
        <div className="pl-4">
          <p className="text-sm font-bold text-gray-800 mb-2">Você compreendeu as orientações sobre cuidados após o tratamento?</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="sim" className="w-4 h-4 accent-black" />
              Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="parcialmente" className="w-4 h-4 accent-black" />
              Parcialmente
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="nao" className="w-4 h-4 accent-black" />
              Não
            </label>
          </div>
        </div>
      </div>

      {/* Seção 3: Avaliação Geral */}
      <div className="border-t border-gray-300 pt-6">
        <h3 className="font-bold text-gray-900 mb-2">3. Avaliação Geral</h3>
        
        <div className="pl-4">
          <p className="text-sm font-bold text-gray-800 mb-2">De forma geral, qual o seu nível de satisfação com o serviço prestado?</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="satisfacao_geral" value="muito_satisfeito" className="w-4 h-4 accent-black" />
              Muito satisfeito
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="satisfacao_geral" value="satisfeito" className="w-4 h-4 accent-black" />
              Satisfeito
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="satisfacao_geral" value="insatisfeito" className="w-4 h-4 accent-black" />
              Insatisfeito
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="satisfacao_geral" value="muito_insatisfeito" className="w-4 h-4 accent-black" />
              Muito insatisfeito
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}