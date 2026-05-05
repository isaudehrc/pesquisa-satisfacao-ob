import React from 'react';

export function AvaliacaoEquipe({ erros = [] }) {
  // A. Fator Humano (Equipe)
  const secaoA = [
    { id: 'cordialidade', texto: 'Cordialidade: Educação e respeito desde a recepção até o consultório.' },
    { id: 'clareza', texto: 'Informação: Clareza nas explicações sobre o seu tratamento e próximos passos.' }
  ];

  // B. Agilidade e Acesso (Processo)
  const secaoB = [
    { id: 'tempo', texto: 'Tempo de Espera: Avaliação do tempo entre a chegada e o início do atendimento.' },
    { id: 'contato', texto: 'Canais de Contato: Facilidade para falar com a unidade (Telefone/WhatsApp).' },
    { id: 'horario', texto: 'Horário de Funcionamento: O quanto o horário da unidade é adequado para você.' }
  ];

  // C. Infraestrutura (O Ambiente)
  const secaoC = [
    { id: 'limpeza', texto: 'Limpeza e Conforto: Higiene das salas e conforto da recepção.' },
    { id: 'acessibilidade', texto: 'Acessibilidade: Facilidade de entrada e circulação (rampas, sinalização).' }
  ];

  // Função auxiliar de engenharia para não repetir código HTML das tabelas
  const renderTable = (itens) => (
    <div className="overflow-x-auto mb-8 shadow-sm rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-800 bg-white">
        <thead className="border-b border-gray-300 bg-gray-100">
          <tr>
            <th className="py-3 px-4 font-extrabold w-[40%] text-gray-900">Itens de Avaliação</th>
            <th className="py-2 px-1 text-center font-bold text-[10px] uppercase w-[12%]">Muito Bom<br/><span className="text-gray-400 font-normal">(5)</span></th>
            <th className="py-2 px-1 text-center font-bold text-[10px] uppercase w-[12%]">Bom<br/><span className="text-gray-400 font-normal">(4)</span></th>
            <th className="py-2 px-1 text-center font-bold text-[10px] uppercase w-[12%]">Regular<br/><span className="text-gray-400 font-normal">(3)</span></th>
            <th className="py-2 px-1 text-center font-bold text-[10px] uppercase w-[12%]">Ruim<br/><span className="text-gray-400 font-normal">(2)</span></th>
            <th className="py-2 px-1 text-center font-bold text-[10px] uppercase w-[12%]">Muito Ruim<br/><span className="text-gray-400 font-normal">(1)</span></th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, index) => {
            const temErro = erros.includes(item.id);
            return (
              <tr key={item.id} className={`border-b border-gray-100 transition-colors ${temErro ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-gray-50'}`}>
                <td className={`py-4 px-4 ${temErro ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{item.texto}</td>
                
                {/* O SISTEMA AGORA GRAVA NÚMEROS DE 5 A 1 */}
                <td className="text-center py-4"><input type="radio" name={item.id} value="5" className="w-5 h-5 accent-black cursor-pointer" /></td>
                <td className="text-center py-4"><input type="radio" name={item.id} value="4" className="w-5 h-5 accent-black cursor-pointer" /></td>
                <td className="text-center py-4"><input type="radio" name={item.id} value="3" className="w-5 h-5 accent-black cursor-pointer" /></td>
                <td className="text-center py-4"><input type="radio" name={item.id} value="2" className="w-5 h-5 accent-black cursor-pointer" /></td>
                <td className="text-center py-4"><input type="radio" name={item.id} value="1" className="w-5 h-5 accent-black cursor-pointer" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="mb-8 border-t border-gray-300 pt-6">
      <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">2. Avaliação de Qualidade</h3>
      <p className="text-sm text-gray-800 mb-6 font-medium">Como você avalia os serviços do CEO-OB nas áreas abaixo?</p>
      
      <h4 className="text-md font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-2 uppercase tracking-wide">A. O Fator Humano (Equipe)</h4>
      {renderTable(secaoA)}

      <h4 className="text-md font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-2 uppercase tracking-wide">B. Agilidade e Acesso (Processos)</h4>
      {renderTable(secaoB)}

      <h4 className="text-md font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-2 uppercase tracking-wide">C. Infraestrutura (O Ambiente)</h4>
      {renderTable(secaoC)}
    </div>
  );
}