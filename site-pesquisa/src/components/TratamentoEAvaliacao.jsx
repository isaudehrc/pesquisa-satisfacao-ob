import React, { useState } from 'react';

export function TratamentoEAvaliacao() {
  // Estado para controlar a interatividade das estrelas
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="mb-8">
      
      {/* Seção 2: Sobre o Tratamento Realizado */}
      <div className="mb-6 border-t border-gray-300 pt-6">
        {/* Navegação Guiada: Título maior e mais destacado */}
        <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">2. Sobre o Tratamento Realizado</h3>
        
        {/* Pergunta 1 da Seção 2 */}
        <div className="mb-4 pl-4">
          <p className="text-sm font-bold text-gray-800 mb-2">O tratamento odontológico que você recebeu:</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              {/* Acessibilidade Touch: w-5 h-5 */}
              <input type="radio" name="atendimento_necessidades" value="totalmente" className="w-5 h-5 accent-black" />
              Atendeu totalmente às suas necessidades
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="parcialmente" className="w-5 h-5 accent-black" />
              Atendeu parcialmente
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="nao_atendeu" className="w-5 h-5 accent-black" />
              Não atendeu
            </label>
          </div>
        </div>

        {/* Pergunta 2 da Seção 2 */}
        <div className="pl-4">
          <p className="text-sm font-bold text-gray-800 mb-2">Você compreendeu as orientações sobre cuidados após o tratamento?</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="sim" className="w-5 h-5 accent-black" />
              Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="parcialmente" className="w-5 h-5 accent-black" />
              Parcialmente
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="nao" className="w-5 h-5 accent-black" />
              Não
            </label>
          </div>
        </div>
      </div>

      {/* Seção 3: Avaliação Geral e CSAT (A Pergunta de Ouro com Estrelas) */}
      <div className="border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">3. Avaliação Geral e Recomendação</h3>
        
        <div className="pl-4">
          <p className="text-sm font-bold text-gray-800 mb-4">De 1 a 5 estrelas, como você avalia sua experiência geral e o quanto recomendaria o CEO-OB?</p>
          
          {/* Lógica interativa das 5 Estrelas */}
          <div className="flex items-center gap-2 ml-2">
            {[...Array(5)].map((star, index) => {
              index += 1;
              return (
                <button
                  type="button"
                  key={index}
                  className={`text-4xl transition-colors duration-200 ${
                    index <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(rating)}
                >
                  <span className="drop-shadow-sm">★</span>
                </button>
              );
            })}
          </div>
          
          {/* Feedback em texto baseado na quantidade de estrelas clicada */}
          <div className="ml-3 mt-2 text-sm text-gray-600 font-medium h-5">
            {rating === 0 && "Clique nas estrelas para avaliar"}
            {rating === 1 && "1 Estrela - Precisa melhorar muito"}
            {rating === 2 && "2 Estrelas - Abaixo do esperado"}
            {rating === 3 && "3 Estrelas - Atendimento regular"}
            {rating === 4 && "4 Estrelas - Bom atendimento"}
            {rating === 5 && "5 Estrelas - Excelente! Recomendo muito!"}
          </div>
          
          {/* Este input invisível vai guardar a nota de 1 a 5 para mandarmos para o Banco de Dados depois! */}
          <input type="hidden" name="satisfacao_geral_estrelas" value={rating} />
        </div>
      </div>

    </div>
  );
}