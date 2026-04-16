import React from 'react';

export function SugestoesEAssinatura() {
  return (
    <div className="border-t border-gray-300 pt-6 mt-6">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-3">4. Sugestões ou Comentários</h3>
        <textarea 
          id="sugestoes" 
          name="sugestoes"
          rows="5"
          placeholder="Espaço reservado para suas críticas, elogios ou sugestões..."
          className="w-full p-4 border border-gray-300 bg-gray-50 focus:outline-none focus:border-black resize-none rounded-md text-gray-800 placeholder:text-gray-400 shadow-sm"
        />
      </div>
      {/* Aqui está a nova frase focada na Saúde Bucal */}
      <p className="text-[12px] text-gray-500 italic pl-1">
        * Sua opinião nos ajuda a construir mais sorrisos e a melhorar a saúde bucal em Ouro Branco.
      </p>
    </div>
  );
}