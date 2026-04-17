import React from 'react';

// Agora o componente recebe a lista de erros
export function DadosGerais({ erros = [] }) {
  
  // Função auxiliar para saber se o campo atual está na lista de erros
  const temErro = (campo) => erros.includes(campo);

  return (
    <div className="mb-8">
      <h3 className="font-bold text-gray-900 mb-4">Dados Gerais:</h3>
      
      <div className="flex flex-col gap-4 pl-4 text-gray-800">
        
        {/* Nome (Opcional - não fica vermelho) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="nome" className="font-medium text-gray-700">Nome (opcional):</label>
          <input 
            type="text" 
            id="nome" 
            name="nome"
            placeholder="Seu nome completo"
            className="border-b border-gray-500 focus:outline-none focus:border-black w-full sm:w-80 px-1 bg-transparent placeholder:text-gray-300"
          />
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Data de Nascimento (Obrigatório) */}
          <div className={`flex items-center gap-2 p-1 rounded-md transition-colors ${temErro('dataNascimento') ? 'bg-red-50 border border-red-300' : ''}`}>
            <label htmlFor="dataNascimento" className={`font-medium ${temErro('dataNascimento') ? 'text-red-600' : 'text-gray-700'}`}>Data de Nascimento:</label>
            <input 
              type="date" 
              id="dataNascimento" 
              name="dataNascimento"
              className="border-b border-gray-500 focus:outline-none focus:border-black px-1 bg-transparent cursor-pointer"
            />
          </div>

          {/* Sexo (Obrigatório) */}
          <div className={`flex items-center gap-2 p-1 rounded-md transition-colors ${temErro('sexo') ? 'bg-red-50 border border-red-300' : ''}`}>
            <label htmlFor="sexo" className={`font-medium ${temErro('sexo') ? 'text-red-600' : 'text-gray-700'}`}>Sexo:</label>
            <select 
              id="sexo" 
              name="sexo"
              className="border-b border-gray-500 focus:outline-none focus:border-black px-1 pb-1 bg-transparent cursor-pointer text-gray-800"
            >
              <option value="" className="text-gray-400">Selecione...</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>

        {/* Município (Obrigatório) */}
        <div className={`flex items-center gap-2 p-1 w-full sm:w-max rounded-md transition-colors ${temErro('municipio') ? 'bg-red-50 border border-red-300' : ''}`}>
          <label htmlFor="municipio" className={`font-medium ${temErro('municipio') ? 'text-red-600' : 'text-gray-700'}`}>Município de residência:</label>
          <input 
            type="text" 
            id="municipio" 
            name="municipio"
            className="border-b border-gray-500 focus:outline-none focus:border-black w-full sm:w-64 px-1 bg-transparent"
          />
        </div>

      </div>
    </div>
  );
}