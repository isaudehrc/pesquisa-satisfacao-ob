import React from 'react';

export function DadosGerais({ erros = [] }) {
  const erroNome = erros.includes('nome');
  const erroNascimento = erros.includes('dataNascimento');
  const erroSexo = erros.includes('sexo');
  const erroMunicipio = erros.includes('municipio');
  const erroEstrelas = erros.includes('satisfacao_geral_estrelas');
  const erroNps = erros.includes('recomendacao_nps');

  return (
    <div className="space-y-8">
      {/* 1. DADOS GERAIS - MANTIDO CONFORME ORIGINAL */}
      <div className="mb-8">
        <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">1. Dados Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-bold mb-1 ${erroNome ? 'text-red-600' : 'text-gray-800'}`}>Nome Completo</label>
            <input type="text" name="nome" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroNome ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Digite seu nome" />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-1 ${erroNascimento ? 'text-red-600' : 'text-gray-800'}`}>Data de Nascimento</label>
            <input type="date" name="dataNascimento" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroNascimento ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-1 ${erroSexo ? 'text-red-600' : 'text-gray-800'}`}>Sexo</label>
            <select name="sexo" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroSexo ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-bold mb-1 ${erroMunicipio ? 'text-red-600' : 'text-gray-800'}`}>Município de Residência</label>
            <input type="text" name="municipio" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroMunicipio ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Ex: Ouro Branco" />
          </div>
        </div>
      </div>

      {/* 4. AVALIAÇÃO GERAL - SEPARADA DA RECOMENDAÇÃO */}
      <div className="mb-8 border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">4. Avaliação Geral</h3>
        <p className="text-sm text-gray-800 mb-4">De modo geral, como você avalia sua experiência no CEO-OB?</p>
        
        <div className={`flex flex-col items-center p-4 rounded-xl border ${erroEstrelas ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="cursor-pointer group">
                <input type="radio" name="satisfacao_geral_estrelas" value={num} className="hidden peer" />
                <span className="text-4xl text-gray-300 peer-checked:text-yellow-400 group-hover:text-yellow-200 transition-colors">★</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between w-full max-w-[200px] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Muito Ruim</span>
            <span>Muito Bom</span>
          </div>
        </div>
      </div>

      {/* 5. RECOMENDAÇÃO (NPS) - O PADRÃO DE MERCADO */}
      <div className="mb-8 border-t border-gray-300 pt-6">
        <h3 className="text-lg font-extrabold text-black mb-2 tracking-tight">5. Recomendação</h3>
        <p className="text-sm text-gray-800 mb-4">De 0 a 10, o quanto você recomendaria o CEO-OB para um amigo ou familiar?</p>
        
        <div className={`p-4 rounded-xl border overflow-x-auto ${erroNps ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between min-w-[500px] gap-1">
            {[...Array(11).keys()].map((num) => (
              <label key={num} className="flex-1 flex flex-col items-center cursor-pointer group">
                <input type="radio" name="recomendacao_nps" value={num} className="hidden peer" />
                <div className="w-full h-10 flex items-center justify-center border border-gray-300 bg-white rounded-md font-black text-gray-600 peer-checked:bg-black peer-checked:text-white group-hover:border-black transition-all">
                  {num}
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            <span>0 - Jamais Recomendaria</span>
            <span>10 - Recomendaria com certeza</span>
          </div>
        </div>
      </div>
    </div>
  );
}