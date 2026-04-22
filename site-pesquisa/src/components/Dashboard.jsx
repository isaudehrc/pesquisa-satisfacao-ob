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

  // --- FUNÇÕES DE TRATAMENTO DE TEXTO ---
  const formatarDataBR = (dataISO) => {
    if (!dataISO) return "N/I";
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const traduzirValor = (valor) => {
    const mapas = {
      'excelente': 'Excelente', 'muito_bom': 'Muito Bom', 'bom': 'Bom', 'regular': 'Regular', 'ruim': 'Ruim',
      'totalmente': 'Atendeu totalmente', 'parcialmente': 'Atendeu parcialmente', 'nao_atendeu': 'Não atendeu',
      'sim': 'Sim', 'nao': 'Não'
    };
    return mapas[valor] || valor;
  };

  // --- MATEMÁTICA E KPIs ---
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

  // A MÁGICA DA IDADE ESTÁ DE VOLTA!
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "N/I";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
  };

  const idadesValidas = fichas.map(f => calcularIdade(f.dataNascimento)).filter(i => i !== "N/I" && !isNaN(i));
  let perfilPrincipal = "Não avaliado";
  let mediaIdade = 0;

  if (idadesValidas.length > 0) {
    const somaIdades = idadesValidas.reduce((a, b) => a + b, 0);
    mediaIdade = Math.round(somaIdades / idadesValidas.length);
    const grupos = {
      "Jovens (Até 19)": idadesValidas.filter(i => i <= 19).length,
      "Adultos (20 a 59)": idadesValidas.filter(i => i >= 20 && i <= 59).length,
      "Idosos (60+)": idadesValidas.filter(i => i >= 60).length,
    };
    perfilPrincipal = Object.keys(grupos).reduce((a, b) => grupos[a] > grupos[b] ? a : b);
  }

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest uppercase">Sincronizando Dados...</div>;

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

        {/* CARDS KPI COM O PÚBLICO PRINCIPAL RESTAURADO */}
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
          
          {/* Card do KPI Chique de Idades */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center relative overflow-hidden">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Público Principal</span>
            <span className="text-2xl font-black text-blue-600 uppercase text-center">{perfilPrincipal}</span>
            {idadesValidas.length > 0 && (
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Idade Média: {mediaIdade} anos</span>
            )}
          </div>
        </div>

        {/* GRÁFICO E TABELA DA DASHBOARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-64 mb-8">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4 block text-center">Distribuição de Notas (Volume)</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribuicaoNotas} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="nota" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={60} />
              <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="quantidade" fill="#1f2937" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
      {/* MODAL COMPACTO (100% ZOOM) COM DATA BR E TRADUÇÕES */}
      {/* ========================================================== */}
      {fichaAberta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-xl shadow-2xl relative my-4 overflow-hidden border-t-8 border-gray-900">
            
            <button 
              onClick={() => setFichaAberta(null)}
              className="absolute top-3 right-3 bg-gray-100 text-gray-500 w-8 h-8 rounded-full hover:bg-red-500 hover:text-white transition-all font-bold text-lg z-20 flex items-center justify-center shadow-md"
            >
              ✕
            </button>

            <div className="bg-gray-50 border-b p-4 text-center">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Detalhes da Avaliação</h2>
            </div>

            <div className="p-6 space-y-6">
              
              {/* 1. DADOS GERAIS */}
              <section>
                <h3 className="text-md font-extrabold text-black mb-3 tracking-tight border-l-4 border-gray-900 pl-2">1. Dados Gerais</h3>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Nome</p>
                    <p className="text-xs font-bold text-gray-800 uppercase">{fichaAberta.nome || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Município</p>
                    <p className="text-xs font-bold text-gray-800 uppercase">{fichaAberta.municipio || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Data Nasc. (BR)</p>
                    <p className="text-xs font-bold text-gray-800">{formatarDataBR(fichaAberta.dataNascimento)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Sexo</p>
                    <p className="text-xs font-bold text-gray-800 uppercase">{fichaAberta.sexo || "N/I"}</p>
                  </div>
                </div>
              </section>

              {/* 2. ATENDIMENTO DA EQUIPE */}
              <section>
                <h3 className="text-md font-extrabold text-black mb-3 tracking-tight border-l-4 border-gray-900 pl-2">2. Atendimento da Equipe</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Cordialidade e respeito', val: fichaAberta.cordialidade },
                    { label: 'Clareza das informações', val: fichaAberta.clareza },
                    { label: 'Facilidade de acesso', val: fichaAberta.acesso },
                    { label: 'Tempo de espera', val: fichaAberta.tempo },
                    { label: 'Ambiente físico', val: fichaAberta.ambiente }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-white border border-gray-50 rounded">
                      <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
                      <span className="text-[10px] font-black text-blue-700 uppercase">{traduzirValor(item.val)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. TRATAMENTO REALIZADO */}
              <section>
                <h3 className="text-md font-extrabold text-black mb-3 tracking-tight border-l-4 border-gray-900 pl-2">3. Tratamento Realizado</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-white border border-gray-50 rounded">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">O tratamento odontológico:</p>
                    <p className="text-[10px] font-black text-blue-700 uppercase">{traduzirValor(fichaAberta.atendimento_necessidades)}</p>
                  </div>
                  <div className="p-2 bg-white border border-gray-50 rounded">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Compreendeu orientações pós-tratamento?</p>
                    <p className="text-[10px] font-black text-blue-700 uppercase">{traduzirValor(fichaAberta.compreensao_orientacoes)}</p>
                  </div>
                </div>
              </section>

              {/* 4. AVALIAÇÃO GERAL */}
              <section>
                <h3 className="text-md font-extrabold text-black mb-3 tracking-tight border-l-4 border-gray-900 pl-2">4. Avaliação e Recomendação</h3>
                <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-3xl ${star <= Number(fichaAberta.satisfacao_geral_estrelas) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                  <span className="ml-3 font-black text-gray-900">{fichaAberta.satisfacao_geral_estrelas}/5</span>
                </div>
              </section>

              {/* 5. OBSERVAÇÕES */}
              <section>
                <h3 className="text-md font-extrabold text-black mb-3 tracking-tight border-l-4 border-gray-900 pl-2">5. Observações</h3>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 italic text-xs text-gray-700 min-h-[60px] leading-relaxed">
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