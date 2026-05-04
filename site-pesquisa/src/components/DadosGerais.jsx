import React from 'react';

export function DadosGerais({ erros = [] }) {
  const erroNome = erros.includes('nome');
  const erroNascimento = erros.includes('dataNascimento');
  const erroSexo = erros.includes('sexo');
  const erroMunicipio = erros.includes('municipio');

  return (
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
  );
}