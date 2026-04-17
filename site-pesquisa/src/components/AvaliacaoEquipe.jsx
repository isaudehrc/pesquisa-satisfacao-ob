import React from 'react';

// Recebemos a lista de erros
export function AvaliacaoEquipe({ erros = [] }) {
  const itens = [
    { id: 'cordialidade', texto: 'Cordialidade e respeito da equipe' },
    { id: 'clareza', texto: 'Clareza das informações recebidas sobre o tratamento' },
    { id: 'acesso', texto: 'Facilidade de acesso à unidade (localização, transporte, horários)' },
    { id: 'tempo', texto: 'Tempo de espera para início do tratamento' },
    { id: 'ambiente', texto: 'Condições do ambiente físico (limpeza, conforto, organização)' }
  ];

  return (
    <div className="mb-8 border-t border-gray-300 pt-6">
      <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">1. Sobre o Atendimento da Equipe</h3>
      <p className="text-sm text-gray-800 mb-4">Como você avalia:</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-800">
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
            {itens.map((item, index) => {
              // Verifica se a pergunta específica desta linha está na lista de erros
              const temErro = erros.includes(item.id);
              
              return (
                <tr key={item.id} className={temErro ? 'bg-red-50 border-l-4 border-red-500' : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white')}>
                  <td className={`py-3 px-2 border-b border-gray-200 ${temErro ? 'text-red-600 font-bold' : ''}`}>{item.texto}</td>
                  <td className="text-center py-3 border-b border-gray-200">
                    <input type="radio" name={item.id} value="excelente" className="w-5 h-5 accent-black cursor-pointer" />
                  </td>
                  <td className="text-center py-3 border-b border-gray-200">
                    <input type="radio" name={item.id} value="muito_bom" className="w-5 h-5 accent-black cursor-pointer" />
                  </td>
                  <td className="text-center py-3 border-b border-gray-200">
                    <input type="radio" name={item.id} value="bom" className="w-5 h-5 accent-black cursor-pointer" />
                  </td>
                  <td className="text-center py-3 border-b border-gray-200">
                    <input type="radio" name={item.id} value="regular" className="w-5 h-5 accent-black cursor-pointer" />
                  </td>
                  <td className="text-center py-3 border-b border-gray-200">
                    <input type="radio" name={item.id} value="ruim" className="w-5 h-5 accent-black cursor-pointer" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}