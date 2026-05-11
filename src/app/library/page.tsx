"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Hash, BookOpen, Search, X, Moon, LibraryBig, Calendar, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

// Paleta de cores dinâmica para as lombadas dos livros
const BOOK_COLORS = ["bg-[#e5ddd3]", "bg-[#d1e1e4]", "bg-[#f2ead0]"];

export default function LibraryDashboard() {
  const router = useRouter();
  const utils = api.useUtils();
  
  // ==========================================
  // CHAMADAS AO BACKEND (tRPC)
  // ==========================================
  
  const { data: books, isLoading } = api.book.getAll.useQuery();

  const createBook = api.book.create.useMutation({
    onSuccess: (newBook) => {
      utils.book.getAll.invalidate();
      setIsBookModalOpen(false);
      // Limpa os campos
      setTitle("");
      setDescription("");
      setSummary("");
      // Redireciona para o novo livro
      router.push(`/library/${newBook.id}/principal`);
    },
  });

  const joinBook = api.book.joinByCode.useMutation({
    onSuccess: () => {
      utils.book.getAll.invalidate();
      setIsCodeModalOpen(false);
      setInviteCode("");
      // Opcional: Redirecionar direto pro livro ou apenas deixar ele aparecer na tela
      // router.push(`/library/${inviteCode.toLowerCase()}/principal`);
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // ==========================================
  // ESTADOS DA UI
  // ==========================================
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados dos formulários
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    createBook.mutate({ title, description, plotSummary: summary });
  };

  const handleJoin = () => {
    if (!inviteCode.trim()) return;
    // Envia o código limpo (remove espaços) e em minúsculas se for padrão do CUID
    joinBook.mutate({ code: inviteCode.trim().toLowerCase() });
  };

  // Filtro de busca local
  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#d6d6d6] flex items-center justify-center p-4 antialiased">
      {/* CONTAINER PRINCIPAL DO DASHBOARD */}
      <div className="w-full max-w-6xl h-[90vh] bg-[#fdfcfb] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col border border-black/5">
        
        {/* Detalhe lateral decorativo */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#e5ddd3] border-r border-black/10 flex flex-col items-center py-6 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.05)] z-10">
          <LibraryBig size={20} className="text-[#8a7f72] opacity-70" />
        </div>

        {/* Botão Dark Mode global (Mock visual) */}
        <div className="absolute top-8 right-10 text-[#a0a0a0] hover:text-black cursor-pointer transition-transform hover:scale-110 z-10">
          <Moon size={22} fill="currentColor" className="opacity-20" />
        </div>

        {/* ÁREA DE SCROLL (Conteúdo da Página) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative pl-16 pr-8 py-10 md:p-16 md:pl-24">
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* HEADER DO DASHBOARD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5">
              <div>
                <h1 className="text-4xl font-serif text-[#3a3a3a] mb-2">Biblioteca Principal</h1>
                <p className="text-[#7a6e5f] text-sm font-serif italic tracking-wide">
                  "Palavras são portas para mundos que ainda não visitamos."
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCodeModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#d1d1d1] rounded-xl text-xs font-bold text-[#5a5a5a] hover:bg-[#f3f0e9] transition-all shadow-sm uppercase tracking-wider"
                >
                  <Hash size={14} />
                  Resgatar
                </button>
                <button 
                  onClick={() => setIsBookModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#4a4a4a] text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md uppercase tracking-wider"
                >
                  <Plus size={14} />
                  Novo Projeto
                </button>
              </div>
            </div>

            {/* BARRA DE BUSCA E FILTROS */}
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0]" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar nos seus manuscritos..."
                  className="w-full pl-12 pr-4 py-3 bg-[#f3f0e9]/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#d1e1e4] focus:bg-white transition-colors text-[#4a4a4a]"
                />
              </div>
              <span className="text-xs text-[#a0a0a0] font-medium uppercase tracking-widest">
                {filteredBooks?.length || 0} Obras encontradas
              </span>
            </div>

            {/* LOADING STATE */}
            {isLoading && (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#8a7f72]" size={40} />
              </div>
            )}

            {/* GRID DE LIVROS REAIS */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {filteredBooks?.map((book, index) => {
                  const dynamicColor = BOOK_COLORS[index % BOOK_COLORS.length];
                  
                  return (
                    <Link href={`/library/${book.id}/principal`} key={book.id}>
                      <div 
                        className={`group relative p-7 h-[280px] rounded-2xl border border-black/5 ${dynamicColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden`}
                      >
                        {/* Fita adesiva decorativa */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/30 backdrop-blur-md -mt-3 rotate-1 shadow-sm" />
                        
                        <div>
                          <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                            <BookOpen size={22} className="text-[#6a6a6a]" />
                          </div>
                          <h3 className="text-base font-serif font-bold text-[#2a2a2a] leading-tight mb-3">
                            {book.title}
                          </h3>
                          <p className="text-sm text-[#5a5a5a] font-serif italic line-clamp-3 leading-relaxed">
                            {book.description || "Sem descrição..."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a6e5f] flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(book.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" title="Projeto Ativo" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: NOVO LIVRO */}
      {isBookModalOpen && (
        <Modal title="Novo Projeto Literário" onClose={() => setIsBookModalOpen(false)}>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest">Título da Obra</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3.5 bg-white border border-[#e0ddd5] rounded-xl focus:outline-none focus:border-[#a09586] focus:ring-1 focus:ring-[#a09586] text-sm text-[#3a3a3a] transition-all" 
                placeholder="Ex: O Coração da Montanha" 
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest">Descrição Curta</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 bg-white border border-[#e0ddd5] rounded-xl focus:outline-none focus:border-[#a09586] focus:ring-1 focus:ring-[#a09586] text-sm text-[#3a3a3a] transition-all" 
                placeholder="Uma frase que define a história..." 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest">Resumo da Trama</label>
              <textarea 
                rows={4} 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3.5 bg-white border border-[#e0ddd5] rounded-xl focus:outline-none focus:border-[#a09586] focus:ring-1 focus:ring-[#a09586] resize-none text-sm text-[#3a3a3a] transition-all" 
                placeholder="Conte mais sobre o universo, os personagens e o conflito central..." 
              />
            </div>
            <button 
              onClick={handleCreate}
              disabled={createBook.isPending}
              className="w-full py-3.5 flex justify-center items-center gap-2 bg-[#3a3a3a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-lg mt-2 disabled:opacity-50"
            >
              {createBook.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              Criar Manuscrito
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL: RESGATAR CÓDIGO */}
      {isCodeModalOpen && (
        <Modal title="Resgatar Convite" onClose={() => setIsCodeModalOpen(false)}>
          <div className="space-y-6 text-center py-4">
            <p className="text-sm text-[#7a6e5f] leading-relaxed">
              Insira o código de acesso enviado pelo autor ou editora para desbloquear a leitura deste universo.
            </p>
            <div className="relative max-w-sm mx-auto">
              <input 
                type="text" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full p-5 text-center text-xl font-mono tracking-[0.2em] uppercase bg-[#f3f0e9]/50 border-2 border-dashed border-[#c0b5a5] rounded-xl focus:outline-none focus:border-[#8a7f72] text-[#3a3a3a] transition-all" 
                placeholder="CÓDIGO AQUI"
              />
            </div>
            <button 
              onClick={handleJoin}
              disabled={joinBook.isPending}
              className="w-full py-3.5 flex justify-center items-center gap-2 bg-[#e5ddd3] border border-[#d5cdcd] text-[#4a4a4a] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d5cdcd] transition-colors disabled:opacity-50"
            >
              {joinBook.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              Verificar Código
            </button>
          </div>
        </Modal>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; border: 2px solid #fdfcfb; }
      `}</style>
    </div>
  );
}

// Componente de Modal
function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2a2a2a]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-[#fdfcfb] w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-black/5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Faixa decorativa no topo do Modal */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#e5ddd3] via-[#d1e1e4] to-[#f2ead0]" />
        
        <div className="p-8 pt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#3a3a3a]">{title}</h2>
            <button onClick={onClose} className="p-2 bg-[#f3f0e9] hover:bg-[#e5ddd3] rounded-full transition-colors">
              <X size={16} className="text-[#5a5a5a]" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}