import React from 'react';

export function DadosGerais({ erros = [] }) {
  // Atualizamos as variáveis de erro para os novos nomes dos campos
  const erroRespondente = erros.includes('respondente');
  const erroFaixaEtaria = erros.includes('faixaEtaria');
  const erroMunicipio = erros.includes('municipio');
  const erroConsentimento = erros.includes('consentimento_lgpd');

  return (
    <div className="mb-8">
      {/* NOVO TÍTULO: Mais profissional e menos focado em "dados pessoais" */}
      <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight">1. Perfil do Usuário</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-bold mb-1 ${erroRespondente ? 'text-red-600' : 'text-gray-800'}`}>Quem está respondendo a pesquisa? *</label>
          <select name="respondente" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroRespondente ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
            <option value="">Selecione...</option>
            <option value="Sou o paciente">Sou o paciente</option>
            <option value="Sou responsável pelo paciente">Sou responsável pelo paciente</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-bold mb-1 ${erroFaixaEtaria ? 'text-red-600' : 'text-gray-800'}`}>Faixa etária do paciente *</label>
          <select name="faixaEtaria" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroFaixaEtaria ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
            <option value="">Selecione...</option>
            <option value="0-12">0 a 12 anos</option>
            <option value="13-17">13 a 17 anos</option>
            <option value="18-25">18 a 25 anos</option>
            <option value="26-40">26 a 40 anos</option>
            <option value="41-60">41 a 60 anos</option>
            <option value="60+">Mais de 60 anos</option>
          </select>
        </div>

        <div>
          {/* GÊNERO AGORA É EXPLICITAMENTE OPCIONAL */}
          <label className="block text-sm font-bold mb-1 text-gray-800">Gênero (Opcional)</label>
          <select name="sexo" className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Selecione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Prefiro não informar">Prefiro não informar</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 ${erroMunicipio ? 'text-red-600' : 'text-gray-800'}`}>Município de Residência *</label>
          <input type="text" name="municipio" className={`w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 ${erroMunicipio ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Ex: Ouro Branco" />
        </div>
      </div>

      {/* BLOCO DE PRIVACIDADE (PADRÃO LGPD) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-4 items-start">
        <div className="text-blue-700 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="text-sm text-blue-900">
          <p className="font-bold mb-1">Privacidade e Proteção de Dados</p>
          <p>Seus dados serão utilizados exclusivamente para análise estatística e melhoria dos serviços prestados. Não compartilhamos suas informações com terceiros e não as utilizamos para identificação pessoal.</p>
        </div>
      </div>

      {/* CHECKBOX DE CONSENTIMENTO OBRIGATÓRIO */}
      <div className="flex items-start gap-2 ml-1">
        <input type="checkbox" name="consentimento_lgpd" id="consentimento" value="sim" className="w-5 h-5 mt-0.5 accent-black cursor-pointer shrink-0" />
        <label htmlFor="consentimento" className={`text-sm font-bold cursor-pointer select-none ${erroConsentimento ? 'text-red-600' : 'text-gray-800'}`}>
          Li e concordo com a Política de Privacidade e com o uso dos meus dados para esta pesquisa. *
        </label>
      </div>
    </div>
  );
}