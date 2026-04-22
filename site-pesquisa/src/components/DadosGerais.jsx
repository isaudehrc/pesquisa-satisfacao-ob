import React from 'react';

export function DadosGerais({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-8">
      {/* Título Padronizado: 1. Dados Gerais */}
      <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">
        1. Dados Gerais
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nome Completo</label>
          <input
            type="text"
            name="nome"
            value={formData.nome || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Digite seu nome"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Data de Nascimento</label>
          <input
            type="date"
            name="dataNascimento"
            value={formData.dataNascimento || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Sexo</label>
          <select
            name="sexo"
            value={formData.sexo || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Selecione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Município de Residência</label>
          <input
            type="text"
            name="municipio"
            value={formData.municipio || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Ex: Ouro Branco"
          />
        </div>
      </div>
    </div>
  );
}