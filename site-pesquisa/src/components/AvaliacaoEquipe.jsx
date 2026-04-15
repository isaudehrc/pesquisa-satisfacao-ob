import React from 'react';

export function AvaliacaoEquipe() {
  // Aqui criamos uma lista com as perguntas para facilitar a montagem da tabela
  const itens = [
    { id: 'cordialidade', texto: 'Cordialidade e respeito da equipe' },
    { id: 'clareza', texto: 'Clareza das informações recebidas sobre o tratamento' },
    { id: 'acesso', texto: 'Facilidade de acesso à unidade (localização, transporte, horários)' },
    { id: 'tempo', texto: 'Tempo de espera para início do tratamento' },
    { id: 'ambiente', texto: 'Condições do ambiente físico (limpeza, conforto, organização)' }
  ];

  return (
    <div className="mb-8 border-t border-gray-300 pt-6">
      <h3 className="font-bold text-gray-900 mb-1">1. Sobre o Atendimento da Equipe</h3>
      <p className="text-sm text-gray-800 mb-4">Como você avalia:</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="border-b border-gray-400">
            <tr>
              <th className="py-2 px-2 font-bold w-1/2">Itens</th>
              <th className="py-2 px-2 text-center font-bold">Ótimo</th>
              <th className="py-2 px-2 text-center font-bold">Bom</th>
              <th className="py-2 px-2 text-center font-bold">Regular</th>
              <th className="py-2 px-2 text-center font-bold">Ruim</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              /* A cor de fundo alterna levemente entre as linhas para facilitar a leitura */
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-3 px-2 border-b border-gray-200">{item.texto}</td>
                
                {/* Note que o 'name' usa o ID do item, garantindo que a escolha seja única por linha */}
                <td className="text-center py-3 border-b border-gray-200">
                  <input type="radio" name={item.id} value="otimo" className="w-4 h-4 accent-black cursor-pointer" />
                </td>
                <td className="text-center py-3 border-b border-gray-200">
                  <input type="radio" name={item.id} value="bom" className="w-4 h-4 accent-black cursor-pointer" />
                </td>
                <td className="text-center py-3 border-b border-gray-200">
                  <input type="radio" name={item.id} value="regular" className="w-4 h-4 accent-black cursor-pointer" />
                </td>
                <td className="text-center py-3 border-b border-gray-200">
                  <input type="radio" name={item.id} value="ruim" className="w-4 h-4 accent-black cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}