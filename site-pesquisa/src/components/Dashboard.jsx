import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- MATEMÁTICA DO VELOCÍMETRO (GAUGE) E DA ROSQUINHA ---
const RADIAN = Math.PI / 180;

const Needle = ({ value, cx, cy, oR, color }) => {
  let total = 200; // Escala do NPS vai de -100 a +100
  const mappedValue = value + 100; 
  const clampedValue = Math.max(0, Math.min(200, mappedValue)); 
  const ang = 180.0 * (1 - clampedValue / total);
  
  // O ponteiro agora vai exatamente até a borda externa (outerRadius)
  const length = oR; 
  
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  
  const x0 = cx;
  const y0 = cy;
  
  // Base do ponteiro
  const r = 8; 
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  
  // Ponta do ponteiro (Fina e longa como painel de carro)
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

  const mediaEstrelas = fichas.length > 0 
    ? (fichas.reduce((acc, ficha) => acc + Number(ficha.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1)
    : 0;

  const promotores = fichas.filter(f => (f.recomendacao_nps !== undefined && Number(f.recomendacao_nps) >= 9) || (f.recomendacao_nps === undefined && Number(f.satisfacao_geral_estrelas) === 5)).length;
  const detratores = fichas.filter(f => (f.recomendacao_nps !== undefined && Number(f.recomendacao_nps) <= 6) || (f.recomendacao_nps === undefined && Number(f.satisfacao_geral_estrelas) <= 3 && Number(f.satisfacao_geral_estrelas) > 0)).length;
  const neutros = fichas.length - promotores - detratores;
  const npsScore = fichas.length > 0 ? Math.round(((promotores - detratores) / fichas.length) * 100) : 0;

  const dataGauge = [
    { name: 'Crítico (-100 a 0)', value: 100, color: '#EF4444' }, 
    { name: 'Atenção (0 a 50)', value: 50, color: '#FBBF24' },   
    { name: 'Excelência (50 a 100)', value: 50, color: '#10B981' } 
  ];

  const distribuicaoNotas = [
    { nota: '5 ★', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 5).length },
    { nota: '4 ★', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 4).length },
    { nota: '3 ★', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 3).length },
    { nota: '2 ★', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 2).length },
    { nota: '1 ★', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 1).length },
  ];

  const calcularMediaItem = (campo) => {
    const notasValidas = fichas.map(f => getValorNumerico(f[campo])).filter(v => v !== null);
    if (notasValidas.length === 0) return 0;
    return (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1);
  };

  const dadosEquipe = [
    { nome: 'Cordialidade', media: Number(calcularMediaItem('cordialidade')) },
    { nome: 'Informação', media: Number(calcularMediaItem('clareza')) },
    { nome: 'Limpeza/Conforto', media: Number(calcularMediaItem('limpeza')) },
    { nome: 'Acessibilidade', media: Number(calcularMediaItem('acessibilidade')) },
    { nome: 'Canais de Contato', media: Number(calcularMediaItem('contato')) },
    { nome: 'Tempo de Espera', media: Number(calcularMediaItem('tempo')) },
    { nome: 'Horários', media: Number(calcularMediaItem('horario')) },
  ].filter(item => item.media > 0).sort((a, b) => b.media - a.media); 

  const obterFaixaEtaria = (ficha) => {
    if (ficha.faixaEtaria) {
      const mapNomes = { '0-12': 'Até 12 anos', '13-17': '13 a 17 anos', '18-25': '18 a 25 anos', '26-40': '26 a 40 anos', '41-60': '41 a 60 anos', '60+': 'Mais de 60 anos' };
      return mapNomes[ficha.faixaEtaria] || ficha.faixaEtaria;
    }
    if (ficha.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(ficha.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      if (idade <= 12) return 'Até 12 anos';
      if (idade <= 17) return '13 a 17 anos';
      if (idade <= 25) return '18 a 25 anos';
      if (idade <= 40) return '26 a 40 anos';
      if (idade <= 60) return '41 a 60 anos';
      return 'Mais de 60 anos';
    }
    return 'Não Informado';
  };

  const faixasCount = {};
  fichas.forEach(f => {
    const faixa = obterFaixaEtaria(f);
    if (faixa !== 'Não Informado') { faixasCount[faixa] = (faixasCount[faixa] || 0) + 1; }
  });

  const coresFaixa = ['#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
  const dadosIdade = Object.keys(faixasCount).map((key, index) => ({ name: key, value: faixasCount[key], color: coresFaixa[index % coresFaixa.length] }));
  const perfilPrincipal = dadosIdade.length > 0 ? dadosIdade.reduce((a, b) => a.value > b.value ? a : b).name : "Sem dados";

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest uppercase">Sincronizando Dados...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Painel Executivo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase">Business Intelligence • Padrão LGPD</p>
          </div>
          <button onClick={handleSair} className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 text-[10px] uppercase border border-red-100">Sair</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Avaliações</span>
            <span className="text-5xl font-black">{fichas.length}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Score NPS</span>
            <span className={`text-5xl font-black ${npsScore >= 50 ? 'text-green-500' : npsScore >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>{npsScore}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Média Estrelas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}</span>
              <span className="text-xl text-yellow-500">★</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Público Dominante</span>
            <span className="text-xl font-black text-blue-600 uppercase leading-tight">{perfilPrincipal}</span>
          </div>
        </div>

        {/* RANKING OPERACIONAL */}
        {dadosEquipe.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-80 mb-6">
            <span className="block text-xs font-black uppercase tracking-widest mb-4 text-center">Desempenho Operacional (Média de 1 a 5)</span>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosEquipe} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tickCount={6} />
                <YAxis dataKey="nome" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="media" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* 1. O VELOCÍMETRO CORRIGIDO (OVERLAY ABSOLUTO) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-80 flex flex-col items-center relative group cursor-pointer">
            <div className="flex items-center gap-2 mb-2 w-full justify-center">
              <span className="text-xs font-black uppercase tracking-widest text-center">Lealdade e Reputação (NPS)</span>
              <span className="text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-gray-200">i</span>
            </div>

            <div className="absolute top-14 z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900 text-white p-4 rounded-lg shadow-2xl w-64 text-xs pointer-events-none border border-gray-700">
              <p className="font-black border-b border-gray-700 pb-2 mb-3 text-gray-300 uppercase tracking-wider text-[10px]">Entendendo as Zonas do NPS</p>
              <ul className="space-y-3">
                <li className="flex gap-2"><span className="text-red-400 font-bold min-w-[70px]">-100 a 0:</span> <span>Zona Crítica</span></li>
                <li className="flex gap-2"><span className="text-yellow-400 font-bold min-w-[70px]">1 a 50:</span> <span>Zona de Aperfeiçoamento</span></li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold min-w-[70px]">51 a 75:</span> <span>Zona de Qualidade</span></li>
                <li className="flex gap-2"><span className="text-green-400 font-bold min-w-[70px]">76 a 100:</span> <span>Zona de Excelência</span></li>
              </ul>
            </div>
            
            <div className="flex justify-center items-center w-full h-full relative mt-4">
              {/* Camada 1: Fundo do Gráfico */}
              <PieChart width={300} height={200}>
                <Pie data={[{value: 200}]} cx={150} cy={140} startAngle={180} endAngle={0} innerRadius={60} outerRadius={68} dataKey="value" stroke="none" isAnimationActive={false}>
                  <Cell fill="#E5E7EB" />
                </Pie>
                <Pie data={dataGauge} cx={150} cy={140} startAngle={180} endAngle={0} innerRadius={70} outerRadius={100} dataKey="value" stroke="none">
                  {dataGauge.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>

                <text x={35} y={145} fill="#6B7280" fontSize="11" fontWeight="bold" textAnchor="middle">-100</text>
                <text x={150} y={20} fill="#6B7280" fontSize="11" fontWeight="bold" textAnchor="middle">0</text>
                <text x={231} y={59} fill="#6B7280" fontSize="11" fontWeight="bold" textAnchor="middle">50</text>
                <text x={265} y={145} fill="#6B7280" fontSize="11" fontWeight="bold" textAnchor="middle">100</text>

                <text x={150} y={185} fill={npsScore >= 50 ? '#10B981' : npsScore >= 0 ? '#FBBF24' : '#EF4444'} fontSize="38" fontWeight="900" textAnchor="middle">
                  {npsScore}
                </text>
              </PieChart>

              {/* Camada 2: Ponteiro Flutuante com Sombra (Fica em cima de TUDO) */}
              <svg width={300} height={200} className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-md">
                <Needle value={npsScore} cx={150} cy={140} oR={100} color="#1f2937" />
              </svg>
            </div>
          </div>

          {/* 2. ROSQUINHA COM PORCENTAGEM */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-80 flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-widest mb-2">Faixa Etária</span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dadosIdade} 
                  innerRadius="45%" 
                  outerRadius="80%" 
                  paddingAngle={2} 
                  dataKey="value" 
                  stroke="none"
                  labelLine={false} 
                  label={renderCustomizedLabel} 
                >
                  {dadosIdade.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 3. DISTRIBUIÇÃO ESTRELAS */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-80">
            <span className="block text-xs font-black uppercase tracking-widest mb-4 text-center">Volume de Estrelas</span>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribuicaoNotas} layout="vertical" margin={{ left: -10 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="nota" type="category" tick={{ fontSize: 10 }} width={40} /><Tooltip /><Bar dataKey="quantidade" fill="#1f2937" radius={[0, 4, 4, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABELA LGPD */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gray-900 p-4 text-white text-xs font-bold uppercase tracking-widest">Base de Dados Anonimizada</div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b">
              <tr><th className="p-4">Data</th><th className="p-4">Respondente</th><th className="p-4">Faixa Etária</th><th className="p-4 text-center">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-400 font-mono text-[11px]">{ficha.data_envio?.toDate().toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-bold uppercase text-xs text-gray-700">{ficha.respondente || "Paciente (Antigo)"}</td>
                  <td className="p-4 font-bold uppercase text-xs text-gray-500">{obterFaixaEtaria(ficha)}</td>
                  <td className="p-4 text-center"><button onClick={() => setFichaAberta(ficha)} className="bg-gray-900 text-white text-[9px] font-bold py-2 px-4 rounded uppercase">Abrir Ficha</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJUSTADO MANTIDO */}
      {fichaAberta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl relative my-4 overflow-hidden border-t-8 border-gray-900">
            <button onClick={() => setFichaAberta(null)} className="absolute top-3 right-3 bg-gray-100 text-gray-500 w-8 h-8 rounded-full font-bold z-20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">✕</button>
            <div className="bg-gray-50 border-b p-4 text-center">
              <h2 className="text-lg font-black uppercase tracking-widest">Detalhes da Avaliação</h2>
            </div>
            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-md font-extrabold mb-3 border-l-4 border-gray-900 pl-2 text-black">1. Perfil do Usuário</h3>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div><p className="text-[9px] font-bold text-gray-400 uppercase">Respondente</p><p className="text-xs font-bold uppercase">{fichaAberta.respondente || "Paciente (Antigo)"}</p></div>
                  <div><p className="text-[9px] font-bold text-gray-400 uppercase">Faixa Etária</p><p className="text-xs font-bold uppercase">{obterFaixaEtaria(fichaAberta)}</p></div>
                  <div><p className="text-[9px] font-bold text-gray-400 uppercase">Município</p><p className="text-xs font-bold uppercase">{fichaAberta.municipio || "N/I"}</p></div>
                  <div><p className="text-[9px] font-bold text-gray-400 uppercase">Gênero</p><p className="text-xs font-bold uppercase">{fichaAberta.sexo || "Não informado"}</p></div>
                </div>
              </section>

              <section>
                <h3 className="text-md font-extrabold mb-3 border-l-4 border-gray-900 pl-2 text-black">2. Qualidade Operacional (Notas de 1 a 5)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: 'Cordialidade', val: fichaAberta.cordialidade }, { label: 'Clareza', val: fichaAberta.clareza }, { label: 'Limpeza', val: fichaAberta.limpeza }, { label: 'Acessibilidade', val: fichaAberta.acessibilidade }, { label: 'Contato', val: fichaAberta.contato }, { label: 'Espera', val: fichaAberta.tempo }, { label: 'Horário', val: fichaAberta.horario }].map((item, i) => {
                    const nota = getValorNumerico(item.val);
                    return nota ? (
                      <div key={i} className="flex justify-between items-center p-2 bg-white border border-gray-100 rounded">
                        <span className="text-[10px] text-gray-600 font-bold">{item.label}</span>
                        <span className={`text-[12px] font-black px-2 py-1 rounded ${nota >= 4 ? 'bg-green-100 text-green-700' : nota === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{nota} / 5</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-md font-extrabold mb-3 border-l-4 border-gray-900 pl-2 text-black">3. Resumo Clínico e Lealdade</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 p-3 bg-white border border-gray-100 rounded">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Tratamento Resolutivo?</p>
                    <p className="text-xs font-black text-blue-700 uppercase">{traduzirValor(fichaAberta.atendimento_necessidades)}</p>
                  </div>
                  <div className="flex-1 p-3 bg-white border border-gray-100 rounded">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Entendeu Orientações?</p>
                    <p className="text-xs font-black text-blue-700 uppercase">{traduzirValor(fichaAberta.compreensao_orientacoes)}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (<span key={star} className={`text-3xl ${star <= Number(fichaAberta.satisfacao_geral_estrelas) ? "text-yellow-400" : "text-gray-200"}`}>★</span>))}
                    <span className="ml-2 font-black">{fichaAberta.satisfacao_geral_estrelas}/5</span>
                  </div>
                  {fichaAberta.recomendacao_nps !== undefined && (
                    <div className="text-center pt-2 border-t border-yellow-200 w-full mt-2">
                      <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">NPS (Recomendação)</p>
                      <p className="text-2xl font-black text-gray-900">{fichaAberta.recomendacao_nps} / 10</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-md font-extrabold mb-2 border-l-4 border-gray-900 pl-2 text-black">4. Observações</h3>
                <div className="p-3 bg-gray-50 rounded-lg border italic text-xs text-gray-700 min-h-[60px]">{fichaAberta.sugestoes || "Nenhuma observação."}</div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}