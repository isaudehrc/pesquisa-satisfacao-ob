import React, { useState } from 'react';

export function TratamentoEAvaliacao({ erros = [] }) {
  const erroNecessidades = erros.includes('atendimento_necessidades');
  const erroOrientacoes = erros.includes('compreensao_orientacoes');
  const erroEstrelas = erros.includes('satisfacao_geral_estrelas');
  const erroNps = erros.includes('recomendacao_nps');

  // --- ESTADOS PARA O EFEITO VISUAL DE PREENCHIMENTO ---
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  const [hoveredNps, setHoveredNps] = useState(null);
  const [selectedNps, setSelectedNps] = useState(null);

  return (
    <div className="mb-8">
      {/* 3. SOBRE O TRATAMENTO */}
      <div className="mb-6 border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">3. Sobre o Tratamento Realizado</h3>
        
        <div className={`mb-4 pl-4 p-2 rounded-md transition-colors ${erroNecessidades ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
          <p className={`text-sm font-bold mb-2 ${erroNecessidades ? 'text-red-600' : 'text-gray-800'}`}>O tratamento odontológico que você recebeu:</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="atendimento_necessidades" value="totalmente" className="w-5 h-5 accent-black" /> Atendeu totalmente às suas necessidades</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="atendimento_necessidades" value="parcialmente" className="w-5 h-5 accent-black" /> Atendeu parcialmente</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="atendimento_necessidades" value="nao_atendeu" className="w-5 h-5 accent-black" /> Não atendeu</label>
          </div>
        </div>

        <div className={`pl-4 p-2 rounded-md transition-colors ${erroOrientacoes ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
          <p className={`text-sm font-bold mb-2 ${erroOrientacoes ? 'text-red-600' : 'text-gray-800'}`}>Você compreendeu as orientações sobre cuidados após o tratamento?</p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="compreensao_orientacoes" value="sim" className="w-5 h-5 accent-black" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="compreensao_orientacoes" value="parcialmente" className="w-5 h-5 accent-black" /> Parcialmente</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="compreensao_orientacoes" value="nao" className="w-5 h-5 accent-black" /> Não</label>
          </div>
        </div>
      </div>

      {/* 4. AVALIAÇÃO GERAL (ESTRELAS CUMULATIVAS) */}
      <div className="mb-8 border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">4. Avaliação Geral</h3>
        <p className="text-sm text-gray-800 mb-4">De modo geral, como você avalia sua experiência no CEO-OB?</p>
        <div className={`flex flex-col items-center p-4 rounded-xl border ${erroEstrelas ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((num) => {
              // Lógica: Se o mouse estiver em cima OU o clicado for maior/igual a este número, ele acende!
              const activeStar = hoveredStar || selectedStar;
              const isActive = num <= activeStar;

              return (
                <label 
                  key={num} 
                  className="cursor-pointer transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredStar(num)}
                  onMouseLeave={() => setHoveredStar(0)}
                >
                  <input 
                    type="radio" 
                    name="satisfacao_geral_estrelas" 
                    value={num} 
                    className="hidden" 
                    onChange={(e) => setSelectedStar(Number(e.target.value))}
                  />
                  <span className={`text-4xl transition-colors duration-200 ${isActive ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Muito Ruim</span>
            <span>Muito Bom</span>
          </div>
        </div>
      </div>

      {/* 5. RECOMENDAÇÃO (NPS CUMULATIVO) */}
      <div className="mb-8 border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">5. Recomendação</h3>
        <p className="text-sm text-gray-800 mb-4">De 0 a 10, o quanto você recomendaria o CEO-OB para um amigo ou familiar?</p>
        <div className={`p-4 rounded-xl border overflow-x-auto ${erroNps ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between min-w-[500px] gap-1">
            {[...Array(11).keys()].map((num) => {
              // Lógica NPS: Pega o Hovered. Se não tiver mouse em cima, pega o Clicado.
              const activeNps = hoveredNps !== null ? hoveredNps : selectedNps;
              const isActive = activeNps !== null && num <= activeNps;

              return (
                <label 
                  key={num} 
                  className="flex-1 flex flex-col items-center cursor-pointer"
                  onMouseEnter={() => setHoveredNps(num)}
                  onMouseLeave={() => setHoveredNps(null)}
                >
                  <input 
                    type="radio" 
                    name="recomendacao_nps" 
                    value={num} 
                    className="hidden" 
                    onChange={(e) => setSelectedNps(Number(e.target.value))}
                  />
                  <div className={`w-full h-10 flex items-center justify-center border rounded-md font-black transition-all duration-200 
                    ${isActive 
                      ? 'bg-black text-white border-black shadow-md scale-105 z-10' 
                      : 'border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    {num}
                  </div>
                </label>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            <span>0 - Jamais Recomendaria</span>
            <span>10 - Recomendaria com certeza</span>
          </div>
        </div>
      </div>
    </div>
  );
}