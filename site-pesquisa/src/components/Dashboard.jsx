import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// Importamos as novas peças para fazer Gráficos de Rosca (PieChart)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

  // =======================================================================
  // --- MÁGICA DOS DADOS (CÁLCULOS PARA O BI) ---
  // =======================================================================
  
  // 1. Média de Estrelas
  const mediaEstrelas = fichas.length > 0 
    ? (fichas.reduce((acc, ficha) => acc + Number(ficha.satisfacao_geral_estrelas || 0), 0) / fichas.length).toFixed(1)
    : 0;

  // 2. Cálculo do NPS (Termômetro de Lealdade)
  const promotores = fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 5).length;
  const neutros = fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 4).length;
  const detratores = fichas.filter(f => Number(f.satisfacao_geral_estrelas) <= 3 && Number(f.satisfacao_geral_estrelas) > 0).length;
  const totalNPS = promotores + neutros + detratores;
  const npsScore = totalNPS > 0 ? Math.round(((promotores - detratores) / totalNPS) * 100) : 0;

  const dadosNPS = [
    { name: 'Promotores (Nota 5)', value: promotores, color: '#10B981' }, // Verde
    { name: 'Neutros (Nota 4)', value: neutros, color: '#FBBF24' },      // Amarelo
    { name: 'Detratores (Nota 1-3)', value: detratores, color: '#EF4444' } // Vermelho
  ].filter(d => d.value > 0); // Só mostra quem tem valor

  // 3. Distribuição de Notas (Gráfico de Barras)
  const distribuicaoNotas = [
    { nota: '5 Estrelas', quantidade: promotores },
    { nota: '4 Estrelas', quantidade: neutros },
    { nota: '3 Estrelas', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 3).length },
    { nota: '2 Estrelas', quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 2).length },
    { nota: '1 Estrela',  quantidade: fichas.filter(f => Number(f.satisfacao_geral_estrelas) === 1).length },
  ];

  // 4. Demografia: Sexo
  const fem = fichas.filter(f => f.sexo === 'Feminino').length;
  const masc = fichas.filter(f => f.sexo === 'Masculino').length;
  const outro = fichas.filter(f => f.sexo === 'Outro').length;
  const nInfor = fichas.filter(f => !f.sexo || (f.sexo !== 'Masculino' && f.sexo !== 'Feminino' && f.sexo !== 'Outro')).length;

  const dadosSexo = [
    { name: 'Feminino', value: fem, color: '#EC4899' },   // Rosa
    { name: 'Masculino', value: masc, color: '#3B82F6' }, // Azul
    { name: 'Outro', value: outro, color: '#8B5CF6' },    // Roxo
    { name: 'Não Informado', value: nInfor, color: '#9CA3AF' } // Cinza
  ].filter(d => d.value > 0);

  // 5. Demografia: Faixa Etária
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
  let dadosIdade = [];

  if (idadesValidas.length > 0) {
    const somaIdades = idadesValidas.reduce((a, b) => a + b, 0);
    mediaIdade = Math.round(somaIdades / idadesValidas.length);
    
    const countJovens = idadesValidas.filter(i => i <= 19).length;
    const countAdultos = idadesValidas.filter(i => i >= 20 && i <= 59).length;
    const countIdosos = idadesValidas.filter(i => i >= 60).length;

    const grupos = {
      "Jovens (Até 19)": countJovens,
      "Adultos (20 a 59)": countAdultos,
      "Idosos (60+)": countIdosos,
    };
    perfilPrincipal = Object.keys(grupos).reduce((a, b) => grupos[a] > grupos[b] ? a : b);

    dadosIdade = [
      { name: 'Jovens (Até 19)', value: countJovens, color: '#14B8A6' }, // Teal
      { name: 'Adultos (20-59)', value: countAdultos, color: '#6366F1' }, // Indigo
      { name: 'Idosos (60+)', value: countIdosos, color: '#F59E0B' }     // Amber
    ].filter(d => d.value > 0);
  }

  // =======================================================================

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium tracking-widest uppercase">Sincronizando Dados...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Painel Executivo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase">Business Intelligence • Ouro Branco</p>
          </div>
          <button onClick={handleSair} className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 text-[10px] uppercase tracking-widest border border-red-100 transition-all">
            Sair
          </button>
        </div>

        {/* LINHA 1: CARDS DE KPI (4 MÓDULOS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total de Avaliações</span>
            <span className="text-5xl font-black text-gray-900">{fichas.length}</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
              Score NPS <span title="Net Promoter Score: % Promotores - % Detratores" className="cursor-help bg-gray-200 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">?</span>
            </span>
            <span className={`text-5xl font-black ${npsScore >= 50 ? 'text-green-500' : npsScore >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>
              {npsScore}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Média de Estrelas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-yellow-500">{mediaEstrelas}</span>
              <span className="text-xl text-yellow-500">★</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-center relative overflow-hidden text-center">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Público Dominante</span>
            <span className="text-2xl font-black text-blue-600 uppercase leading-tight">{perfilPrincipal}</span>
            {idadesValidas.length > 0 && (
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Idade Média: {mediaIdade} anos</span>
            )}
          </div>
        </div>

        {/* LINHA 2: GRÁFICOS DEMOGRÁFICOS (MAPA DO PÚBLICO) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico Sexo */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-900 text-xs font-black uppercase tracking-widest mb-2 border-b-2 border-gray-900 pb-1">Mapa de Gênero</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Proporção de Atendimentos</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosSexo} innerRadius="50%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                    {dadosSexo.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Idade */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center">
            <span className="text-gray-900 text-xs font-black uppercase tracking-widest mb-2 border-b-2 border-gray-900 pb-1">Mapa de Faixa Etária</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Ciclo de Vida dos Pacientes</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosIdade} innerRadius="50%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                    {dadosIdade.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LINHA 3: DESEMPENHO E LEALDADE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico Barras (Volume) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-72 flex flex-col">
            <span className="text-gray-900 text-xs font-black uppercase tracking-widest mb-2 text-center">Volume de Notas</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 text-center">Quantos pacientes deram cada nota?</p>
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

          {/* Gráfico NPS (Lealdade) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-72 flex flex-col items-center">
            <span className="text-gray-900 text-xs font-black uppercase tracking-widest mb-2 border-b-2 border-gray-900 pb-1">Termômetro de Lealdade (NPS)</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Classificação de Recomendação</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosNPS} innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                  {dadosNPS.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABELA DE REGISTROS (Abaixo dos gráficos) */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gray-900 p-4">
            <h2 className="text-white text-xs font-bold uppercase tracking-widest">Base de Dados: Últimos Registros</h2>
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
      {/* MODAL (O mesmo de antes, mantido intacto) */}
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
              {/* Seção 1 */}
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
              {/* Seção 2 */}
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
              {/* Seção 3 */}
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
              {/* Seção 4 */}
              <section>
                <h3 className="text-md font-extrabold text-black mb-3 tracking-tight border-l-4 border-gray-900 pl-2">4. Avaliação e Recomendação</h3>
                <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-3xl ${star <= Number(fichaAberta.satisfacao_geral_estrelas) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                  <span className="ml-3 font-black text-gray-900">{fichaAberta.satisfacao_geral_estrelas}/5</span>
                </div>
              </section>
              {/* Seção 5 */}
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