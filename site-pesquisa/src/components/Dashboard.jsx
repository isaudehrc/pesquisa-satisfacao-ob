import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [fichas, setFichas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [fichaAberta, setFichaAberta] = useState(null); // Estado para controlar qual ficha está sendo lida
  const navigate = useNavigate();

  // SEGURANÇA: Vigia da porta dos fundos
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

  // --- CÁLCULOS DE INTELIGÊNCIA ---
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

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "N/I";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
  };

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest">SINCRONIZANDO...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
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
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Público Atendido</span>
            <span className="text-lg font-black text-blue-600 uppercase">Amostra Global</span>
          </div>
        </div>

        {/* TABELA DE DADOS COM O NOVO BOTÃO "VER" */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gray-900 p-4">
            <h2 className="text-white text-xs font-bold uppercase tracking-widest">Histórico de Fichas</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Município</th>
                <th className="p-4 text-center">Nota</th>
                <th className="p-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-400 font-mono text-[11px]">
                    {ficha.data_envio?.toDate().toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 font-bold text-gray-800 uppercase text-xs">
                    {ficha.nome || "Anônimo"}
                  </td>
                  <td className="p-4 text-gray-500 italic text-xs">
                    {ficha.municipio || "N/I"}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-black text-[10px] border border-yellow-200">
                      {ficha.satisfacao_geral_estrelas} ★
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setFichaAberta(ficha)}
                      className="bg-gray-900 text-white text-[9px] font-bold py-1 px-3 rounded uppercase hover:bg-blue-600 transition-all shadow-sm"
                    >
                      Ver Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* O MODAL DA FICHA COMPLETA (MODO LEITURA) */}
      {/* ========================================================== */}
      {fichaAberta && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-t-8 border-gray-900 animate-in fade-in zoom-in duration-200">
            
            {/* Cabeçalho do Modal */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <div>
                <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Detalhes da Avaliação</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {fichaAberta.id}</p>
              </div>
              <button 
                onClick={() => setFichaAberta(null)}
                className="bg-gray-100 text-gray-500 w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-600 transition-all font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo da Ficha */}
            <div className="p-8 space-y-8">
              
              {/* Seção 1: Perfil */}
              <section>
                <h4 className="text-[11px] font-black uppercase text-blue-600 mb-4 tracking-[0.2em] border-b pb-2">1. Perfil do Paciente</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nome</p>
                    <p className="font-bold text-gray-800 text-sm uppercase">{fichaAberta.nome || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Idade</p>
                    <p className="font-bold text-gray-800 text-sm">{calcularIdade(fichaAberta.dataNascimento)} anos</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sexo</p>
                    <p className="font-bold text-gray-800 text-sm uppercase">{fichaAberta.sexo || "N/I"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Município</p>
                    <p className="font-bold text-gray-800 text-sm uppercase">{fichaAberta.municipio || "N/I"}</p>
                  </div>
                </div>
              </section>

              {/* Seção 2: Equipe e Atendimento */}
              <section>
                <h4 className="text-[11px] font-black uppercase text-blue-600 mb-4 tracking-[0.2em] border-b pb-2">2. Desempenho da Equipe</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-xs font-medium text-gray-600">Cordialidade e Respeito</span>
                    <span className="font-black text-gray-900 text-xs uppercase">{fichaAberta.cordialidade}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-xs font-medium text-gray-600">Clareza nas Explicações</span>
                    <span className="font-black text-gray-900 text-xs uppercase">{fichaAberta.clareza}</span>
                  </div>
                </div>
              </section>

              {/* Seção 3: Infraestrutura */}
              <section>
                <h4 className="text-[11px] font-black uppercase text-blue-600 mb-4 tracking-[0.2em] border-b pb-2">3. Ambiente e Tempo</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-xs font-medium text-gray-600">Facilidade de Acesso</span>
                    <span className="font-black text-gray-900 text-xs uppercase">{fichaAberta.acesso}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-xs font-medium text-gray-600">Tempo de Espera</span>
                    <span className="font-black text-gray-900 text-xs uppercase">{fichaAberta.tempo}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-xs font-medium text-gray-600">Higiene e Conforto</span>
                    <span className="font-black text-gray-900 text-xs uppercase">{fichaAberta.ambiente}</span>
                  </div>
                </div>
              </section>

              {/* Seção 4: Sugestões */}
              <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                <h4 className="text-[11px] font-black uppercase text-yellow-700 mb-2 tracking-[0.2em]">Observações e Sugestões</h4>
                <p className="text-gray-700 text-sm italic italic leading-relaxed">
                  "{fichaAberta.sugestoes || "O paciente não deixou comentários adicionais."}"
                </p>
              </section>

            </div>

            {/* Rodapé do Modal */}
            <div className="p-6 border-t bg-gray-50 text-center">
              <button 
                onClick={() => setFichaAberta(null)}
                className="bg-gray-900 text-white font-black py-3 px-10 rounded-lg text-xs uppercase tracking-widest hover:bg-black shadow-md"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}