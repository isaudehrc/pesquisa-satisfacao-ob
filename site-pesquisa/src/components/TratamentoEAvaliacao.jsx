import React from 'react';

export function TratamentoEAvaliacao({ formData, setFormData }) {
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, satisfacao_geral_estrelas: rating.toString() }));
  };

  return (
    <div>
      {/* SEÇÃO 3: SOBRE O TRATAMENTO */}
      <div className="mb-8 border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">
          3. Sobre o Tratamento Realizado
        </h3>

        {/* Pergunta 1 */}
        <div className="mb-4 pl-4 p-2">
          <p className="text-sm font-bold mb-2 text-gray-800">
            O tratamento odontológico que você recebeu:
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="totalmente" checked={formData.atendimento_necessidades === 'totalmente'} onChange={handleRadioChange} className="w-5 h-5 accent-black" required />
              Atendeu totalmente às suas necessidades
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="parcialmente" checked={formData.atendimento_necessidades === 'parcialmente'} onChange={handleRadioChange} className="w-5 h-5 accent-black" />
              Atendeu parcialmente
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="atendimento_necessidades" value="nao_atendeu" checked={formData.atendimento_necessidades === 'nao_atendeu'} onChange={handleRadioChange} className="w-5 h-5 accent-black" />
              Não atendeu
            </label>
          </div>
        </div>

        {/* Pergunta 2 */}
        <div className="pl-4 p-2">
          <p className="text-sm font-bold mb-2 text-gray-800">
            Você compreendeu as orientações sobre cuidados após o tratamento?
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-800 ml-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="sim" checked={formData.compreensao_orientacoes === 'sim'} onChange={handleRadioChange} className="w-5 h-5 accent-black" required />
              Sim
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="parcialmente" checked={formData.compreensao_orientacoes === 'parcialmente'} onChange={handleRadioChange} className="w-5 h-5 accent-black" />
              Parcialmente
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="compreensao_orientacoes" value="nao" checked={formData.compreensao_orientacoes === 'nao'} onChange={handleRadioChange} className="w-5 h-5 accent-black" />
              Não
            </label>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: AVALIAÇÃO GERAL ESTRELAS */}
      <div className="border-t border-gray-300 pt-6 mb-8">
        <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">
          4. Avaliação Geral e Recomendação
        </h3>
        <div className="pl-4 p-2">
          <p className="text-sm font-bold mb-4 text-gray-800">
            De 1 a 5 estrelas, como você avalia sua experiência geral e o quanto recomendaria o CEO-OB?
          </p>
          <div className="flex items-center gap-2 ml-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className={`text-4xl drop-shadow-sm transition-colors hover:text-yellow-400 focus:outline-none ${
                  star <= Number(formData.satisfacao_geral_estrelas || 0) ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}