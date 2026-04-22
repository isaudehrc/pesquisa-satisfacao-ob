import React from 'react';

export function AvaliacaoEquipe({ formData, setFormData }) {
  const handleChange = (e, itemId) => {
    setFormData((prev) => ({ ...prev, [itemId]: e.target.value }));
  };

  const itens = [
    { id: 'cordialidade', texto: 'Cordialidade e respeito da equipe (recepção, dentistas e auxiliares)' },
    { id: 'clareza', texto: 'Clareza das informações recebidas sobre o tratamento' },
    { id: 'acesso', texto: 'Facilidade de acesso à unidade (localização, transporte, horários)' },
    { id: 'tempo', texto: 'Tempo de espera para início do atendimento/tratamento' },
    { id: 'ambiente', texto: 'Condições do ambiente físico (limpeza, conforto, organização)' }
  ];

  const opcoes = [
    { valor: 'excelente', label: 'Excelente' },
    { valor: 'muito_bom', label: 'Muito Bom' },
    { valor: 'bom', label: 'Bom' },
    { valor: 'regular', label: 'Regular' },
    { valor: 'ruim', label: 'Ruim' }
  ];

  return (
    <div className="mb-8 border-t border-gray-300 pt-6">
      {/* Título Padronizado: 2 */}
      <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">
        2. Sobre o Atendimento da Equipe
      </h3>
      <p className="text-sm text-gray-800 mb-4 font-bold">Como você avalia:</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-800 min-w-[600px]">
          <thead className="border-b border-gray-400">
            <tr>
              <th className="py-2 px-2 font-bold min-w-[200px]">Itens</th>
              <th className="py-2 px-2 text-center font-bold">Excelente</th>
              <th className="py-2 px-2 text-center font-bold">Muito Bom</th>
              <th className="py-2 px-2 text-center font-bold">Bom</th>
              <th className="py-2 px-2 text-center font-bold">Regular</th>
              <th className="py-2 px-2 text-center font-bold">Ruim</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-3 px-2 border-b border-gray-200">{item.texto}</td>
                {opcoes.map((opcao) => (
                  <td key={opcao.valor} className="text-center py-3 border-b border-gray-200">
                    <input
                      type="radio"
                      name={item.id}
                      value={opcao.valor}
                      checked={formData[item.id] === opcao.valor}
                      onChange={(e) => handleChange(e, item.id)}
                      className="w-5 h-5 accent-black cursor-pointer"
                      required
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}