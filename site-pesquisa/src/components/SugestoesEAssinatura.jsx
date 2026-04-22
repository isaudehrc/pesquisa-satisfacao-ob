import React from 'react';

export function SugestoesEAssinatura() {
  return (
    <div className="border-t border-gray-300 pt-6 mb-8">
      <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">5. Observações e Sugestões</h3>
      
      <p className="text-sm text-gray-800 mb-2 font-bold">
        Tem alguma sugestão, elogio ou reclamação que gostaria de deixar? (Opcional)
      </p>
      <textarea
        name="sugestoes"
        rows="4"
        className="w-full border border-gray-400 p-3 rounded-md text-sm text-gray-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 mb-6"
        placeholder="Digite sua mensagem aqui..."
      />

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-inner">
        <p className="text-sm text-gray-600 font-bold text-center uppercase tracking-widest">
          Agradecemos sua participação! Sua opinião é fundamental para a melhoria do CEO Ouro Branco.
        </p>
      </div>
    </div>
  );
}