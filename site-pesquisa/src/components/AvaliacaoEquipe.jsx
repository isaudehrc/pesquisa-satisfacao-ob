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
      {/* Navegação Guiada: Título um pouco maior e com negrito mais forte */}
      <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">1. Sobre o Atendimento da Equipe</h3>
      <p className="text-sm text-gray-800 mb-4">Como você avalia:</p>
      
      {/* O overflow garante a rolagem lateral no celular para não quebrar o layout */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="border-b border-gray-400">
            <tr>
              {/* Ajuste de UX: min-w-[200px] para o texto não ficar espremido no celular */}
              <th className="py-2 px-2 font-bold min-w-[200px]">Itens</th>
              
              {/* Padrão HCAHPS: Excelente, Muito Bom, Bom, Regular, Ruim */}
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
                
                {/* Acessibilidade Touch: w-5 h-5 */}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}