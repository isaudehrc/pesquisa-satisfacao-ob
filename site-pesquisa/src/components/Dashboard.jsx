import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- MATEMÁTICA DO VELOCÍMETRO (GAUGE) ---
const RADIAN = Math.PI / 180;

const Needle = ({ value, cx, cy, oR, color }) => {
  let total = 200; 
  const mappedValue = value + 100; 
  const clampedValue = Math.max(0, Math.min(200, mappedValue)); 
  const ang = 180.0 * (1 - clampedValue / total);
  const length = oR; 
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const x0 = cx;
  const y0 = cy;
  const r = 7; 
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <path d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} Z`} fill={color} stroke="none" />
      <circle cx={x0} cy={y0} r={14} fill={color} stroke="none" />
      <circle cx={x0} cy={y0} r={5} fill="#F3F4F6" stroke="none" />
    </g>
  );
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null; 
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" className="drop-shadow-md">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

  const traduzirValor = (valor) => {
    const mapas = {
      'totalmente': 'Atendeu totalmente', 'parcialmente': 'Atendeu parcialmente', 'nao_atendeu': 'Não atendeu',
      'sim': 'Sim', 'nao': 'Não'
    };
    return mapas[valor] || valor;
  };

  const getValorNumerico = (valor) => {
    if (!valor) return null;
    if (!isNaN(valor)) return Number(valor); 
    const mapa = { 'muito_bom': 5, 'bom': 4, 'regular': 3, 'ruim': 2, 'muito_ruim': 1 };
    return mapa[valor] || null; 
  };

  const formatarRespondenteTabela = (texto) => {
    const str = String(texto || '').toLowerCase();
    if (str.includes('responsável') || str.includes('responsavel') || str.includes('familiar')) return 'RESPONSÁVEL';
    return 'PACIENTE';
  };

  // --- CÁLCULOS DOS KPIs ---
  const mediaEstrelas = fichas.length > 0 ? (fichas.reduce((acc, ficha) => acc + Number(ficha.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1) : 0;
  const promotores = fichas.filter(f => (f.recomendacao_nps !== undefined && Number(f.recomendacao_nps) >= 9) || (f.recomendacao_nps === undefined && Number(f.satisfacao_geral_estrelas) === 5)).length;
  const detratores = fichas.filter(f => (f.recomendacao_nps !== undefined && Number(f.recomendacao_nps) <= 6) || (f.recomendacao_nps === undefined && Number(f.satisfacao_geral_estrelas) <= 3 && Number(f.satisfacao_geral_estrelas) > 0)).length;
  const npsScore = fichas.length > 0 ? Math.round(((promotores - detratores) / fichas.length) * 100) : 0;

  // NOVO KPI: GÊNERO PREDOMINANTE
  const countsGen = { Feminino: 0, Masculino: 0, Outro: 0 };
  fichas.forEach(f => {
    const g = String(f.sexo || f.genero || '').toLowerCase();
    if (g.includes('fem')) countsGen.Feminino++;
    else if (g.includes('masc')) countsGen.Masculino++;
    else countsGen.Outro++;
  });
  const generoPredominante = Object.keys(countsGen).reduce((a, b) => countsGen[a] > countsGen[b] ? a : b);

  const dataGauge = [
    { name: 'Crítico (-100 a 0)', value: 100, color: '#EF4444' }, 
    { name: 'Atenção (0 a 50)', value: 50, color: '#FBBF24' },   
    { name: 'Excelência (50 a 100)', value: 50, color: '#10B981' } 
  ];

  const calcularMediaItem = (campo) => {
    const notasValidas = fichas.map(f => getValorNumerico(f[campo])).filter(v => v !== null);
    if (notasValidas.length === 0) return 0;
    return (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1);
  };
  
  const dadosEquipe = [
    { nome: 'Cordialidade', media: Number(calcularMediaItem('cordialidade')) },
    { nome: 'Informação', media: Number(calcularMediaItem('clareza')) },
    { nome: 'Limpeza', media: Number(calcularMediaItem('limpeza')) },
    { nome: 'Acessibilidade', media: Number(calcularMediaItem('acessibilidade')) },
    { nome: 'Contato', media: Number(calcularMediaItem('contato')) },
    { nome: 'Espera', media: Number(calcularMediaItem('tempo')) },
    { nome: 'Horários', media: Number(calcularMediaItem('horario')) },
  ].filter(item => item.media > 0).sort((a, b) => b.media - a.media); 

  // DEMOGRAFIA
  const obterFaixaEtaria = (ficha) => {
    if (ficha.faixaEtaria) return ficha.faixaEtaria;
    if (ficha.dataNascimento) {
      const hoje = new Date(); const nascimento = new Date(ficha.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      if (idade <= 12) return 'Até 12'; if (idade <= 25) return '13 a 25';
      if (idade <= 40) return '26 A 40'; if (idade <= 60) return '41 a 60'; return '60+';
    } return 'N/I';
  };

  const faixasCount = {};
  fichas.forEach(f => {
    const faixa = obterFaixaEtaria(f);
    if (faixa !== 'N/I') { faixasCount[faixa] = (faixasCount[faixa] || 0) + 1; }
  });

  const perfilPrincipal = Object.keys(faixasCount).length > 0 
    ? Object.keys(faixasCount).reduce((a, b) => faixasCount[a] > faixasCount[b] ? a : b) 
    : "N/I";

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest uppercase">Sincronizando Dados...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER ALINHADO À DIREITA */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-right w-full">Painel Executivo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase text-right w-full">Business Intelligence • Padrão LGPD</p>
          </div>
          <button onClick={handleSair} className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 text-[10px] uppercase border border-red-100">Sair</button>
        </div>

        {/* 1. KPIs CENTRALIZADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total de Avaliações</span>
            <span className="text-5xl font-black">{fichas.length}</span>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Gênero Predominante</span>
            <span className="text-3xl font-black text-gray-900 uppercase">{generoPredominante}</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center relative group">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Satisfação Geral Média</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}</span>
              <span className="text-xl text-yellow-500">★</span>
            </div>
          </div>

          {/* KPI IDADE DO PÚBLICO DOMINANTE (FIGURA 2) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-black uppercase tracking-widest mb-3 flex gap-1 justify-center w-full">
              <span className="text-gray-900">Idade do</span>
              <span className="text-gray-400">Público Dominante</span>
            </div>
            <span className="text-4xl font-black text-blue-600 uppercase leading-tight tracking-tight">
              {perfilPrincipal.replace(/anos/i, '').trim()}
            </span>
          </div>
        </div>

        {/* 2. TABELA CENTRALIZADA COM LUPA */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mt-8">
          <div className="bg-[#111827] p-4 text-white text-xs font-bold uppercase tracking-widest text-right">
            Base de Dados
          </div>
          <table className="w-full text-center text-sm">
            <thead className="bg-white text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="p-4 text-center w-1/4">Data e Hora</th>
                <th className="p-4 text-center w-1/4">Respondente</th>
                <th className="p-4 text-center w-1/4">Faixa Etária</th>
                <th className="p-4 text-center w-1/4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-[11px] text-center">
                    {ficha.data_envio?.toDate().toLocaleDateString('pt-BR')} às {ficha.data_envio?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 font-bold uppercase text-xs text-gray-700 text-center">
                    {formatarRespondenteTabela(ficha.respondente || ficha.quem_responde || ficha.tipo_respondente)}
                  </td>
                  <td className="p-4 font-bold uppercase text-xs text-gray-500 text-center">
                    {obterFaixaEtaria(ficha)}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setFichaAberta(ficha)} 
                      className="bg-black text-white text-[10px] font-bold py-2 px-4 rounded shadow-md hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MANTIDO */}
      {fichaAberta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl relative my-4 overflow-hidden border-t-8 border-gray-900">
            <button onClick={() => setFichaAberta(null)} className="absolute top-3 right-3 bg-gray-100 text-gray-500 w-8 h-8 rounded-full font-bold z-20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">✕</button>
            <div className="bg-gray-50 border-b p-4 text-center">
              <h2 className="text-lg font-black uppercase tracking-widest">Detalhes da Avaliação</h2>
            </div>
            {/* ... Resto do Modal ... */}
          </div>
        </div>
      )}
    </div>
  );
}