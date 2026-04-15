import React from 'react';

export function SugestoesEAssinatura() {
  return (
    <div className="border-t border-gray-300 pt-6 mt-6 pb-4">
      
      {/* Seção 4: Sugestões ou Comentários */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-3">4. Sugestões ou Comentários</h3>
        <textarea 
          id="sugestoes" 
          name="sugestoes"
          rows="5"
          placeholder="Digite aqui suas sugestões..."
          className="w-full p-3 border-b-2 border-l border-gray-300 bg-gray-50 focus:outline-none focus:border-black resize-none text-sm text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {/* Seção de Assinaturas e Nome */}
      <div className="border-t border-gray-300 pt-6 mt-8 text-sm text-gray-800 space-y-6 pl-4">
        
        <p>Se desejar, pode assinar:</p>

        {/* Linha da Assinatura */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Assinatura:</span>
          <input 
            type="text" 
            id="assinatura" 
            name="assinatura"
            className="border-b border-gray-500 focus:outline-none focus:border-black w-72 px-1 bg-transparent"
          />
        </div>

        {/* Linha do Nome */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Nome (opcional):</span>
          <input 
            type="text" 
            id="nome" 
            name="nome"
            className="border-b border-gray-500 focus:outline-none focus:border-black w-72 px-1 bg-transparent"
          />
        </div>

      </div>
    </div>
  );
}