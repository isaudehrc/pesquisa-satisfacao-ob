import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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

  if (carregando) return <div className="p-10 text-center text-gray-500 font-medium">Sincronizando com Firebase...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border-l-8 border-gray-900">
          <div>
            {/* TRAVA DE ALINHAMENTO: text-left */}
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-left">Painel Administrativo CEO</h1>
            <p className="text-xs text-gray-500 font-bold uppercase text-left">Registros totais: {fichas.length}</p>
          </div>
          <button onClick={handleSair} className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 text-[10px] uppercase tracking-widest border border-red-100">Sair</button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-white uppercase text-[10px] tracking-widest font-bold">
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