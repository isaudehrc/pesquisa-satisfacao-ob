import React from 'react';

export function DadosGerais() {
  return (
    <div className="mb-8">
      <h3 className="font-bold text-gray-900 mb-4">Dados Gerais:</h3>
      
      <div className="flex flex-col gap-4 pl-4 text-sm text-gray-800">
        
        {/* Aqui está o Calendário Inteligente! */}
        <div className="flex items-center gap-2">
          <label htmlFor="dataNascimento" className="font-medium text-gray-700">Data de Nascimento:</label>
          <input 
            type="date" 
            id="dataNascimento" 
            name="dataNascimento"
            className="border-b border-gray-500 focus:outline-none focus:border-black px-1 bg-transparent text-gray-800 cursor-pointer"
          />
        </div>

        {/* Sexo */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Sexo:</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="sexo" value="feminino" className="w-4 h-4 accent-black" />
            Feminino
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="sexo" value="masculino" className="w-4 h-4 accent-black" />
            Masculino
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="sexo" value="outro" className="w-4 h-4 accent-black" />
            Outro
          </label>
        </div>

        {/* Município de residência */}
        <div className="flex items-center gap-2">
          <label htmlFor="municipio" className="font-medium text-gray-700">Município de residência:</label>
          <input 
            type="text" 
            id="municipio" 
            name="municipio"
            className="border-b border-gray-500 focus:outline-none focus:border-black w-64 px-1 bg-transparent"
          />
        </div>

      </div>
    </div>
  );
}