import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Bar, Line 
} from 'recharts';

// --- MATEMÁTICA DO VELOCÍMETRO (NPS) ---
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
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
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
      const lista = [];
      querySnapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setFichas(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSair = () => signOut(auth).then(() => navigate('/login'));

  // --- PROCESSAMENTO DE DADOS ---
  const mediaEstrelas = fichas.length > 0 ? (fichas.reduce((acc, f) => acc + Number(f.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1) : 0;
  
  // Gênero Predominante
  const genCounts = { Feminino: 0, Masculino: 0, Outro: 0 };
  fichas.forEach(f => {
    const g = String(f.sexo || '').toLowerCase();
    if (g.includes('fem')) genCounts.Feminino++;
    else if (g.includes('masc')) genCounts.Masculino++;
    else genCounts.Outro++;
  });
  const generoPredominante = Object.keys(genCounts).reduce((a, b) => genCounts[a] > genCounts[b] ? a : b);

  // Público Dominante
  const faixas = {};
  fichas.forEach(f => { if(f.faixaEtaria) faixas[f.faixaEtaria] = (faixas[f.faixaEtaria] || 0) + 1 });
  const perfilPrincipal = Object.keys(faixas).length > 0 ? Object.keys(faixas).reduce((a, b) => faixas[a] > faixas[b] ? a : b) : "N/I";

  // NPS
  const promotores = fichas.filter(f => Number(f.recomendacao_nps) >= 9).length;
  const detratores = fichas.filter(f => Number(f.recomendacao_nps) <= 6).length;
  const npsScore = fichas.length > 0 ? Math.round(((promotores - detratores) / fichas.length) * 100) : 0;

  // Tendência Temporal (Figura 1)
  const dadosTendencia = Object.values(fichas.reduce((acc, f) => {
    const d = f.data_envio?.toDate().toLocaleDateString('pt-BR');
    if (!acc[d]) acc[d] = { data: d, volume: 0, soma: 0 };
    acc[d].volume++;
    acc[d].soma += Number(f.satisfacao_geral_estrelas || 0);
    return acc;
  }, {})).map(g => ({ data: g.data, volume: g.volume, media: (g.soma / g.volume).toFixed(1) })).reverse();

  // Clínicos (Resolução e Compreensão)
  const res = { resolvido: 0, parcial: 0, nao: 0 };
  const comp = { sim: 0, parcial: 0, nao: 0 };
  fichas.forEach(f => {
    const r = String(f.atendimento_necessidades || '').toLowerCase();
    if (r.includes('totalmente')) res.resolvido++; else if (r.includes('parcial')) res.parcial++; else res.nao++;
    const c = String(f.compreensao_orientacoes || '').toLowerCase();
    if (c === 'sim') comp.sim++; else if (c.includes('parcial')) comp.parcial++; else comp.nao++;
  });

  if (carregando) return <div className="p-10 text-center font-bold">SINCRONIZANDO...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div className="text-right w-full">
            <h1 className="text-2xl font-bold">Painel Executivo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase">Business Intelligence • Ouro Branco</p>
          </div>
          <button onClick={handleSair} className="ml-6 bg-red-50 text-red-600 px-4 py-2 rounded font-bold text-[10px] uppercase border border-red-100">Sair</button>
        </div>

        {/* 1. KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase mb-2">Total Avaliações</span>
            <span className="text-5xl font-black">{fichas.length}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase mb-2 text-red-500">Gênero Predominante</span>
            <span className="text-3xl font-black uppercase">{generoPredominante}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase mb-2">Satisfação Média</span>
            <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}★</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-black uppercase mb-3"><span className="text-gray-900">Idade do</span> <span className="text-gray-400">Público Dominante</span></div>
            <span className="text-4xl font-black text-blue-600 uppercase">{perfilPrincipal.replace(/anos/i, '')}</span>
          </div>
        </div>

        {/* 2. GRÁFICO DE TENDÊNCIA (VOLUME VS QUALIDADE) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-80 mb-6">
          <span className="block text-xs font-black uppercase mb-6 text-center text-gray-500 tracking-widest">Evolução: Volume de Atendimentos vs Média de Notas</span>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="data" tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis yAxisId="left" tick={{fontSize: 10}} label={{ value: 'Volume', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{fontSize: 10}} label={{ value: 'Média ⭐', angle: 90, position: 'insideRight', fontSize: 10 }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar yAxisId="left" dataKey="volume" name="Volume" fill="#111827" radius={[4, 4, 0, 0]} barSize={30} />
              <Line yAxisId="right" type="monotone" dataKey="media" name="Média Satisfação" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 3. CLÍNICOS E NPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* VELOCÍMETRO NPS */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-72 flex flex-col items-center justify-center">
            <span className="text-xs font-black uppercase mb-2">Lealdade (NPS)</span>
            <div className="relative w-[280px] h-[160px] mx-auto">
              <PieChart width={280} height={160}>
                <Pie data={[{v:100, c:'#EF4444'}, {v:50, c:'#FBBF24'}, {v:50, c:'#10B981'}]} cx={140} cy={140} startAngle={180} endAngle={0} innerRadius={70} outerRadius={100} dataKey="v" stroke="none">
                  {[{v:100, c:'#EF4444'}, {v:50, c:'#FBBF24'}, {v:50, c:'#10B981'}].map((e, i) => <Cell key={i} fill={e.c} />)}
                </Pie>
                <text x={140} y={155} fill={npsScore >= 50 ? '#10B981' : '#EF4444'} fontSize="32" fontWeight="900" textAnchor="middle">{npsScore}</text>
              </PieChart>
              <svg width={280} height={160} className="absolute top-0 left-0"><Needle value={npsScore} cx={140} cy={140} oR={100} color="#1f2937" /></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-72 flex flex-col items-center">
            <span className="text-xs font-black uppercase mb-2">Resolução Clínica</span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{n:'Resolvido', v:res.resolvido, c:'#10B981'}, {n:'Parcial', v:res.parcial, c:'#FBBF24'}, {n:'Não', v:res.nao, c:'#EF4444'}].filter(d=>d.v>0)} innerRadius="40%" outerRadius="75%" dataKey="v" label={renderCustomizedLabel}>
                  {[{n:'Resolvido', v:res.resolvido, c:'#10B981'}, {n:'Parcial', v:res.parcial, c:'#FBBF24'}, {n:'Não', v:res.nao, c:'#EF4444'}].map((e, i) => <Cell key={i} fill={e.c} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{fontSize:'10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-72 flex flex-col items-center">
            <span className="text-xs font-black uppercase mb-2">Entendimento</span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{n:'Sim', v:comp.sim, c:'#3B82F6'}, {n:'Parcial', v:comp.parcial, c:'#93C5FD'}, {n:'Não', v:comp.nao, c:'#1E3A8A'}].filter(d=>d.v>0)} innerRadius="40%" outerRadius="75%" dataKey="v" label={renderCustomizedLabel}>
                  {[{n:'Sim', v:comp.sim, c:'#3B82F6'}, {n:'Parcial', v:comp.parcial, c:'#93C5FD'}, {n:'Não', v:comp.nao, c:'#1E3A8A'}].map((e, i) => <Cell key={i} fill={e.c} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{fontSize:'10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. TABELA CENTRALIZADA */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-[#111827] p-4 text-white text-xs font-bold uppercase text-right">Base de Dados Histórica</div>
          <table className="w-full text-center text-sm">
            <thead className="bg-white text-gray-500 uppercase text-[10px] font-bold border-b">
              <tr><th className="p-4">Data e Hora</th><th className="p-4">Respondente</th><th className="p-4">Faixa Etária</th><th className="p-4">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors text-center font-bold">
                  <td className="p-4 text-gray-400 font-mono text-[11px]">{f.data_envio?.toDate().toLocaleDateString('pt-BR')} às {f.data_envio?.toDate().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</td>
                  <td className="p-4 uppercase text-xs text-gray-700">{f.respondente || "PACIENTE"}</td>
                  <td className="p-4 uppercase text-xs text-gray-500">{f.faixaEtaria}</td>
                  <td className="p-4"><button className="bg-black text-white text-[10px] font-bold py-2 px-4 rounded flex items-center justify-center mx-auto gap-2">Visualizar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}