import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// PASSO 1: Importamos as peças do Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [fichas, setFichas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

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
    signOut(auth);
    navigate('/login');
  };

  // --- CÁLCULOS PARA OS GRÁFICOS (A Mágica dos Dados) ---
  
  // 1. Calcula a Média Geral de Estrelas
  const mediaEstrelas = fichas.length > 0 
    ? (fichas.reduce((acc, ficha) => acc + Number(ficha.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1)
    : 0;

  // 2. Prepara os dados para o Gráfico de Barras (Quantas de cada nota?)
  const distribuicaoNotas = [
    { nota: '5 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '5').length },
    { nota: '4 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '4').length },
    { nota: '3 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '3').length },
    { nota: '2 Estrelas', quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '2').length },
    { nota: '1 Estrela',  quantidade: fichas.filter(f => f.satisfacao_geral_estrelas === '1').length },
  ];

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium">Sincronizando com Firebase...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO SUPERIOR */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-left">Painel Administrativo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase text-left">Visão Geral de Desempenho</p>
          </div>
          <button onClick={handleSair} className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 text-[10px] uppercase tracking-widest border border-red-100">
            Sair
          </button>
        </div>

        {/* ÁREA DE GRÁFICOS E RESUMOS (NOVO!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Total de Registros */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total de Avaliações</span>
            <span className="text-5xl font-black text-gray-900">{fichas.length}</span>
          </div>

          {/* Card 2: Média Geral */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Média de Satisfação</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}</span>
              <span className="text-xl text-yellow-500">★</span>
            </div>
          </div>

          {/* Card 3: Gráfico de Barras */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-48">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 block text-center">Distribuição de Notas</span>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribuicaoNotas} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="nota" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={60} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="quantidade" fill="#1f2937" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* TABELA DE DADOS (Mantida exatamente como estava) */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gray-900 p-4">
            <h2 className="text-white text-xs font-bold uppercase tracking-widest">Últimos Registros</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b border-gray-200">
              <tr>
                <th className="p-4 text-left">Data</th>
                <th className="p-4 text-left">Paciente</th>
                <th className="p-4 text-left">Município</th>
                <th className="p-4 text-center">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((ficha) => {
                const nomeFinal = (!ficha.nome || ficha.nome === "Não informado") ? "Anônimo" : ficha.nome;
                const municipioFinal = (!ficha.municipio || ficha.municipio === "Não informado") ? "Não informado" : ficha.municipio;

                return (
                  <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-400 font-mono text-[11px] text-left">
                      {ficha.data_envio?.toDate().toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 font-bold text-gray-800 uppercase text-xs text-left">{nomeFinal}</td>
                    <td className="p-4 text-gray-500 italic text-xs uppercase text-left">{municipioFinal}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-black text-[11px] border border-yellow-200">
                        {ficha.satisfacao_geral_estrelas} ★
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}