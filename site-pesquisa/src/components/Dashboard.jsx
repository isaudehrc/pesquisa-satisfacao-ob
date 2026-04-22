import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [fichas, setFichas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [fichaAberta, setFichaAberta] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const vigia = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/login');
    });
    return () => vigia();
  }, [navigate]);

  useEffect(() => {
    const q = query(collection(db, 'fichas_avaliacao'), orderBy('data_envio', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaFichas = [];
      querySnapshot.forEach((doc) => {
        listaFichas.push({ id: doc.id, ...doc.data() });
      });
      setFichas(listaFichas);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSair = () => {
    signOut(auth).then(() => navigate('/login'));
  };

  // Funções de tradução para mostrar o texto bonito em vez do valor técnico do banco
  const traduzirValor = (valor) => {
    const mapas = {
      'excelente': 'Excelente', 'muito_bom': 'Muito Bom', 'bom': 'Bom', 'regular': 'Regular', 'ruim': 'Ruim',
      'totalmente': 'Atendeu totalmente às suas necessidades', 'parcialmente': 'Atendeu parcialmente', 'nao_atendeu': 'Não atendeu',
      'sim': 'Sim', 'nao': 'Não'
    };
    return mapas[valor] || valor;
  };

  const mediaEstrelas = fichas.length > 0 
    ? (fichas.reduce((acc, ficha) => acc + Number(ficha.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1)
    : 0;

  const distribuicaoNotas = [
    { nota: '5 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '5').length },
    { nota: '4 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '4').length },
    { nota: '3 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '3').length },
    { nota: '2 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '2').length },
    { nota: '1 Estrela',  quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '1').length },
  ];

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest">SINCRONIZANDO...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Painel Administrativo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase">Gestão Ouro Branco</p>
          </div>
          <button onClick={handleSair} className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 text-[10px] uppercase tracking-widest border border-red-100 transition-all">
            Sair
          </button>
        </div>

        {/* CARDS KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total de Avaliações</span>
            <span className="text-5xl font-black text-gray-900">{fichas.length}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Média de Satisfação</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}</span>
              <span className="text-xl text-yellow-500">★</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Status do Sistema</span>
            <span className="text-lg font-black text-green-600 uppercase">Online</span>
          </div>
        </div>

        {/* TABELA DE REGISTROS */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gray-900 p-4">
            <h2 className="text-white text-xs font-bold uppercase tracking-widest">Últimos Registros</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Paciente</th>
                <th className="p-4 text-center">Nota</th>
                <th className="p-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-[11px]">{ficha.data_envio?.toDate().toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold text-gray-800 uppercase text-xs">{ficha.nome || "Anônimo"}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-black text-[10px] border border-yellow-200">
                      {ficha.satisfacao_geral_estrelas} ★
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setFichaAberta(ficha)}
                      className="bg-gray-900 text-white text-[9px] font-bold py-2 px-4 rounded uppercase hover:bg-blue-600 transition-all shadow-sm tracking-widest"
                    >
                      Abrir Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODAL DE VISUALIZAÇÃO LIMPA (1-5) */}
      {/* ========================================================== */}
      {fichaAberta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl relative my-8 overflow-hidden">
            
            <button 
              onClick={() => setFichaAberta(null)}
              className="absolute top-4 right-4 bg-gray-200 text-gray-600 w-10 h-10 rounded-full hover:bg-red-500 hover:text-white transition-all font-bold text-xl z-20 flex items-center justify-center shadow-md"
            >
              ✕
            </button>

            <div className="bg-gray-50 border-b p-6 text-center">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Detalhes da Avaliação</h2>
            </div>

            <div className="p-8 space-y-8">
              
              {/* 1. DADOS GERAIS */}
              <section>
                <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight border-l-4 border-gray-900 pl-3">1. Dados Gerais</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Nome</p>
                    <p className="text-sm font-bold text-gray-800 uppercase">{fichaAberta.nome || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Município</p>
                    <p className="text-sm font-bold text-gray-800 uppercase">{fichaAberta.municipio || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Data Nasc.</p>
                    <p className="text-sm font-bold text-gray-800">{fichaAberta.dataNascimento || "N/I"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Sexo</p>
                    <p className="text-sm font-bold text-gray-800 uppercase">{fichaAberta.sexo || "N/I"}</p>
                  </div>
                </div>
              </section>

              {/* 2. ATENDIMENTO DA EQUIPE */}
              <section>
                <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight border-l-4 border-gray-900 pl-3">2. Sobre o Atendimento da Equipe</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Cordialidade e respeito da equipe', val: fichaAberta.cordialidade },
                    { label: 'Clareza das informações recebidas', val: fichaAberta.clareza },
                    { label: 'Facilidade de acesso à unidade', val: fichaAberta.acesso },
                    { label: 'Tempo de espera para início', val: fichaAberta.tempo },
                    { label: 'Condições do ambiente físico', val: fichaAberta.ambiente }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded shadow-sm">
                      <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                      <span className="text-xs font-black text-blue-700 uppercase">{traduzirValor(item.val)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. TRATAMENTO REALIZADO */}
              <section>
                <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight border-l-4 border-gray-900 pl-3">3. Sobre o Tratamento Realizado</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-white border border-gray-100 rounded shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">O tratamento odontológico recebido:</p>
                    <p className="text-xs font-black text-blue-700 uppercase">{traduzirValor(fichaAberta.atendimento_necessidades)}</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Compreendeu as orientações pós-tratamento?</p>
                    <p className="text-xs font-black text-blue-700 uppercase">{traduzirValor(fichaAberta.compreensao_orientacoes)}</p>
                  </div>
                </div>
              </section>

              {/* 4. AVALIAÇÃO GERAL */}
              <section>
                <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight border-l-4 border-gray-900 pl-3">4. Avaliação Geral e Recomendação</h3>
                <div className="flex items-center justify-center gap-2 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-4xl ${star <= Number(fichaAberta.satisfacao_geral_estrelas) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                  <span className="ml-4 font-black text-gray-900">{fichaAberta.satisfacao_geral_estrelas}/5</span>
                </div>
              </section>

              {/* 5. OBSERVAÇÕES */}
              <section>
                <h3 className="text-lg font-extrabold text-black mb-4 tracking-tight border-l-4 border-gray-900 pl-3">5. Observações e Sugestões</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 italic text-sm text-gray-700 min-h-[80px]">
                  {fichaAberta.sugestoes || "Nenhuma observação registrada."}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}