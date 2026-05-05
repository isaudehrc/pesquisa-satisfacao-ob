import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart 
} from 'recharts';

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

  const getValorNumerico = (valor) => {
    if (!valor) return null;
    if (!isNaN(valor)) return Number(valor); 
    const mapa = { 'muito_bom': 5, 'bom': 4, 'regular': 3, 'ruim': 2, 'muito_ruim': 1 };
    return mapa[valor] || null; 
  };

  // --- 1. PROCESSAMENTO DE TENDÊNCIA TEMPORAL (FIGURA 1) ---
  const processarDadosTendencia = () => {
    const grupos = {};
    fichas.forEach(f => {
      const dataStr = f.data_envio?.toDate().toLocaleDateString('pt-BR');
      if (!grupos[dataStr]) {
        grupos[dataStr] = { data: dataStr, volume: 0, somaNotas: 0 };
      }
      grupos[dataStr].volume += 1;
      grupos[dataStr].somaNotas += Number(f.satisfacao_geral_estrelas || 0);
    });

    return Object.values(grupos).map(g => ({
      ...g,
      media: (g.somaNotas / g.volume).toFixed(1)
    })).reverse(); // Do mais antigo para o mais novo
  };

  const dadosTendencia = processarDadosTendencia();

  // --- 2. CÁLCULOS DOS KPIs ---
  const mediaEstrelas = fichas.length > 0 ? (fichas.reduce((acc, ficha) => acc + Number(ficha.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1) : 0;
  
  const countsGen = { Feminino: 0, Masculino: 0, Outro: 0 };
  fichas.forEach(f => {
    const g = String(f.sexo || f.genero || '').toLowerCase();
    if (g.includes('fem')) countsGen.Feminino++;
    else if (g.includes('masc')) countsGen.Masculino++;
    else countsGen.Outro++;
  });
  const generoPredominante = Object.keys(countsGen).reduce((a, b) => countsGen[a] > countsGen[b] ? a : b);

  const obterFaixaEtaria = (ficha) => {
    if (ficha.faixaEtaria) return ficha.faixaEtaria;
    return 'N/I';
  };

  const faixasCount = {};
  fichas.forEach(f => {
    const faixa = obterFaixaEtaria(f);
    if (faixa !== 'N/I') faixasCount[faixa] = (faixasCount[faixa] || 0) + 1;
  });
  const perfilPrincipal = Object.keys(faixasCount).length > 0 
    ? Object.keys(faixasCount).reduce((a, b) => faixasCount[a] > faixasCount[b] ? a : b) 
    : "N/I";

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest uppercase">Sincronizando Dados...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
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
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-red-500">Gênero Predominante</span>
            <span className="text-3xl font-black text-gray-900 uppercase">{generoPredominante}</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Satisfação Geral Média</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}</span>
              <span className="text-xl text-yellow-500">★</span>
            </div>
          </div>

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

        {/* 2. NOVO GRÁFICO COMBINADO (FIGURA 1) - TENDÊNCIA TEMPORAL */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-96 mb-6">
          <span className="block text-xs font-black uppercase tracking-widest mb-6 text-center">Tendência: Volume vs Qualidade</span>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="data" tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis yAxisId="left" orientation="left" stroke="#111827" tick={{fontSize: 10}} label={{ value: 'Volume', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" domain={[0, 5]} tick={{fontSize: 10}} label={{ value: 'Média ⭐', angle: 90, position: 'insideRight', fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              {/* Colunas representam o volume (Figura 1) */}
              <Bar yAxisId="left" dataKey="volume" name="Volume de Atendimentos" fill="#111827" radius={[4, 4, 0, 0]} barSize={30} />
              {/* Linha representa a tendência da média (Figura 1) */}
              <Line yAxisId="right" type="monotone" dataKey="media" name="Média de Satisfação" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 3. TABELA LGPD CENTRALIZADA COM LUPA */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-[#111827] p-4 text-white text-xs font-bold uppercase tracking-widest text-right">Base de Dados</div>
          <table className="w-full text-center text-sm">
            <thead className="bg-white text-gray-500 uppercase text-[10px] font-bold border-b">
              <tr>
                <th className="p-4">Data e Hora</th>
                <th className="p-4">Respondente</th>
                <th className="p-4">Faixa Etária</th>
                <th className="p-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-[11px]">
                    {ficha.data_envio?.toDate().toLocaleDateString('pt-BR')} às {ficha.data_envio?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 font-bold uppercase text-xs text-gray-700">
                    {(ficha.respondente || "Paciente").toUpperCase()}
                  </td>
                  <td className="p-4 font-bold uppercase text-xs text-gray-500">{obterFaixaEtaria(ficha)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setFichaAberta(ficha)} className="bg-black text-white text-[10px] font-bold py-2 px-4 rounded flex items-center justify-center mx-auto gap-2">
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
    </div>
  );
}