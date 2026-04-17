import React from 'react';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho do Painel */}
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm mb-8 border-l-4 border-blue-900">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Painel de Gestão - CEO Ouro Branco</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral das avaliações de satisfação do SUS</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-md border border-gray-200">
            <span className="text-sm font-bold text-gray-700">Acesso Restrito</span>
          </div>
        </header>

        {/* Área onde as fichas vão aparecer (Por enquanto, um aviso visual) */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">
            🚧 O sistema de captação do Firebase será conectado aqui no próximo passo...
          </p>
        </div>

      </div>
    </div>
  );
}