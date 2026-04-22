import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// =======================================================================
// COMPONENTE AUXILIAR: Desenha a pergunta exatamente como no formulário
// =======================================================================
const PerguntaRadio = ({ pergunta, resposta }) => {
  const opcoes = ["Ótimo", "Bom", "Regular", "Ruim", "Péssimo"];
  
  return (
    <div className="mb-6">
      <p className="text-sm font-bold text-gray-800 mb-3">{pergunta}</p>
      <div className="flex flex-wrap gap-4">
        {opcoes.map(opcao => {
          const selecionado = resposta === opcao;
          return (
            <div 
              key={opcao} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                selecionado 
                  ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              {/* A "Bolinha" do Radio */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                selecionado ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
              }`}>
                {selecionado && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className="text-xs font-black uppercase tracking-wide">{opcao}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =======================================================================
// O PAINEL PRINCIPAL
// =======================================================================
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

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center relative overflow-hidden">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Público Principal</span>
            <span className="text-2xl font-black text-blue-600 uppercase text-center">{perfilPrincipal}</span>
            {idadesValidas.length > 0 && (
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Idade Média: {mediaIdade} anos</span>
            )}
          </div>
        </div>

        {/* GRÁFICO E TABELA */}
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
            <h2 className="text-white text-xs font-bold uppercase tracking-widest">Histórico de Fichas</h2>
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
      {/* RÉPLICA DO FORMULÁRIO (MODAL WYSIWYG) */}
      {/* ========================================================== */}
      {fichaAberta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4 md:p-10 backdrop-blur-sm overflow-y-auto">
          
          <div className="bg-white max-w-4xl w-full rounded-xl shadow-2xl relative mt-auto mb-auto overflow-hidden">
            
            {/* Botão Fechar Flutuante */}
            <button 
              onClick={() => setFichaAberta(null)}
              className="absolute top-4 right-4 bg-gray-200 text-gray-600 w-10 h-10 rounded-full hover:bg-red-500 hover:text-white transition-all font-bold text-xl z-20 flex items-center justify-center shadow-md"
              title="Fechar Ficha"
            >
              ✕
            </button>

            {/* Cabeçalho da Ficha */}
            <div className="bg-gray-50 border-b border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Pesquisa de Satisfação</h2>
              <p className="text-sm font-bold text-gray-500 uppercase mt-1">Centro de Especialidades Odontológicas</p>
              <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-md text-xs font-black uppercase tracking-[0.2em] border border-blue-200 shadow-sm">
                Modo Leitura • Ficha ID: {fichaAberta.id.substring(0, 8)}...
              </div>
            </div>

            <div className="p-8 md:p-12">
              
              {/* 1. DADOS GERAIS */}
              <div className="mb-12">
                <div className="bg-gray-900 text-white font-bold uppercase text-xs tracking-[0.2em] p-3 mb-6 rounded shadow-sm">
                  1. Dados Gerais
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Nome do Paciente</label>
                    <input disabled value={fichaAberta.nome || "Não informado"} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-bold uppercase cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Data de Nascimento</label>
                    <input disabled type="date" value={fichaAberta.dataNascimento || ""} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-bold cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Sexo</label>
                    <input disabled value={fichaAberta.sexo || "Não informado"} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-bold uppercase cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Município</label>
                    <input disabled value={fichaAberta.municipio || "Não informado"} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-bold uppercase cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* 2. AVALIAÇÃO DA EQUIPE */}
              <div className="mb-12">
                <div className="bg-gray-900 text-white font-bold uppercase text-xs tracking-[0.2em] p-3 mb-6 rounded shadow-sm">
                  2. Avaliação da Equipe e Atendimento
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm">
                  <PerguntaRadio 
                    pergunta="Como você avalia a cordialidade e o respeito da equipe (recepção e dentistas)?" 
                    resposta={fichaAberta.cordialidade} 
                  />
                  <div className="h-px bg-gray-100 w-full my-6"></div>
                  <PerguntaRadio 
                    pergunta="Como você avalia a clareza das explicações fornecidas pelo dentista sobre o seu tratamento?" 
                    resposta={fichaAberta.clareza} 
                  />
                </div>
              </div>

              {/* 3. TRATAMENTO E AVALIAÇÃO (COM AS ESTRELAS) */}
              <div className="mb-12">
                <div className="bg-gray-900 text-white font-bold uppercase text-xs tracking-[0.2em] p-3 mb-6 rounded shadow-sm">
                  3. Tratamento e Avaliação Geral
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm mb-6">
                  <PerguntaRadio pergunta="Como você avalia a facilidade de acesso ao CEO?" resposta={fichaAberta.acesso} />
                  <div className="h-px bg-gray-100 w-full my-6"></div>
                  <PerguntaRadio pergunta="Como você avalia o tempo de espera?" resposta={fichaAberta.tempo} />
                  <div className="h-px bg-gray-100 w-full my-6"></div>
                  <PerguntaRadio pergunta="Como você avalia o ambiente do CEO (higiene e conforto)?" resposta={fichaAberta.ambiente} />
                  <div className="h-px bg-gray-100 w-full my-6"></div>
                  <PerguntaRadio pergunta="Como você avalia o atendimento às suas necessidades odontológicas?" resposta={fichaAberta.atendimento_necessidades} />
                  <div className="h-px bg-gray-100 w-full my-6"></div>
                  <PerguntaRadio pergunta="Como você avalia a sua compreensão sobre os cuidados pós-tratamento?" resposta={fichaAberta.compreensao_orientacoes} />
                </div>

                {/* Bloco Exclusivo das Estrelas */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center shadow-inner">
                  <p className="font-black text-gray-900 uppercase text-lg mb-6 tracking-widest">Grau de Satisfação Geral</p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg 
                        key={star} 
                        className={`w-14 h-14 drop-shadow-md transition-colors ${star <= Number(fichaAberta.satisfacao_geral_estrelas || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase mt-6 tracking-[0.3em]">
                    {fichaAberta.satisfacao_geral_estrelas} de 5 Estrelas
                  </p>
                </div>
              </div>

              {/* 4. SUGESTÕES */}
              <div>
                <div className="bg-gray-900 text-white font-bold uppercase text-xs tracking-[0.2em] p-3 mb-6 rounded shadow-sm">
                  4. Observações e Sugestões
                </div>
                <textarea 
                  disabled 
                  value={fichaAberta.sugestoes || ""}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-sm text-gray-700 font-bold min-h-[150px] cursor-not-allowed italic"
                  placeholder="O paciente não deixou comentários adicionais."
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}