{/* --- STORY 3: MODAL DE ENVIO ANÔNIMO --- */}
{mostrarModalAnonimo && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div className="bg-white p-7 rounded-lg max-w-sm w-full shadow-2xl border-t-4 border-gray-900">
      <h4 className="font-bold text-xl mb-3 text-gray-900">Identificação</h4>
      <p className="text-gray-600 mb-6 leading-relaxed">
        Não identificamos um **Nome** válido. Deseja enviar sua avaliação de forma anônima?
      </p>
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => setMostrarModalAnonimo(false)}
          className="px-4 py-2 text-gray-500 font-bold hover:text-black transition-colors uppercase text-xs tracking-widest"
        >
          Voltar
        </button>
        <button 
          onClick={() => enviarParaFirebase({ ...dadosTemporarios, nome: "Anônimo" })}
          className="px-6 py-3 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-700 transition-all uppercase text-xs tracking-widest shadow-lg"
        >
          Sim, Anônimo
        </button>
      </div>
    </div>
  </div>
)}