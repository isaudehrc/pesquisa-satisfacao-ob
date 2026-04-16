import React from 'react';

export function DadosGerais() {
  return (
    <div className="mb-8">
      <h3 className="font-bold text-gray-900 mb-4">Dados Gerais:</h3>
      
      <div className="flex flex-col gap-4 pl-4 text-gray-800">
        
        {/* Nome */}
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
          {/* Data de Nascimento */}
          <div className="flex items-center gap-2">
            <label htmlFor="dataNascimento" className="font-medium text-gray-700">Data de Nascimento:</label>
            <input 
              type="date" 
              id="dataNascimento" 
              name="dataNascimento"
              className="border-b border-gray-500 focus:outline-none focus:border-black px-1 bg-transparent cursor-pointer"
            />
          </div>

          {/* Sexo (Agora como Menu Suspenso / Dropdown) */}
          <div className="flex items-center gap-2">
            <label htmlFor="sexo" className="font-medium text-gray-700">Sexo:</label>
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

        {/* Município */}
        <div className="flex items-center gap-2">
          <label htmlFor="municipio" className="font-medium text-gray-700">Município de residência:</label>
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