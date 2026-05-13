"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Hash, BookOpen, Search, X, Moon, LibraryBig, Calendar, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

const BOOK_COLORS = ["bg-[#e5ddd3]", "bg-[#d1e1e4]", "bg-[#f2ead0]"];

export default function LibraryDashboard() {
  const router = useRouter();
  const utils = api.useUtils();
  
  const { data: books, isLoading } = api.book.getAll.useQuery();

  const createBook = api.book.create.useMutation({
    onSuccess: (newBook) => {
      utils.book.getAll.invalidate();
      setIsBookModalOpen(false);
      setTitle("");
      setDescription("");
      setSummary("");
      router.push(`/library/${newBook.id}/principal`);
    },
  });

  const joinBook = api.book.joinByCode.useMutation({
    onSuccess: () => {
      utils.book.getAll.invalidate();
      setIsCodeModalOpen(false);
      setInviteCode("");
    },
    onError: (err) => alert(err.message)
  });

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    joinBook.mutate({ code: inviteCode.trim().toLowerCase() });
  };

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#d6d6d6] flex items-center justify-center p-2 sm:p-4 antialiased">
      <div className="w-full max-w-6xl min-h-[90vh] md:h-[90vh] bg-[#fdfcfb] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col border border-black/5">
        
        {/* Sidebar Decorativa - Escondida em telas muito pequenas ou reduzida */}
        <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-[#e5ddd3] border-r border-black/10 hidden sm:flex flex-col items-center py-6 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.05)] z-10">
          <LibraryBig size={20} className="text-[#8a7f72] opacity-70" />
        </div>

        {/* Botão Dark Mode - Ajustado posicionamento */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-10 text-[#a0a0a0] hover:text-black cursor-pointer transition-transform hover:scale-110 z-10">
          <Moon size={22} fill="currentColor" className="opacity-20" />
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-6 py-10 sm:pl-20 sm:pr-10 md:p-16 md:pl-24">
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
            
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black/5">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-serif text-[#3a3a3a]">Biblioteca</h1>
                <p className="text-[#7a6e5f] text-sm font-serif italic tracking-wide max-w-md">
                  "Palavras são portas para mundos que ainda não visitamos."
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsCodeModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#d1d1d1] rounded-xl text-xs font-bold text-[#5a5a5a] hover:bg-[#f3f0e9] transition-all shadow-sm uppercase"
                >
                  <Hash size={14} /> Resgatar
                </button>
                <button 
                  onClick={() => setIsBookModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4a4a4a] text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md uppercase"
                >
                  <Plus size={14} /> Novo Projeto
                </button>
              </div>
            </div>

            {/* BUSCA */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0]" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar manuscritos..."
                  className="w-full pl-12 pr-4 py-3 bg-[#f3f0e9]/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-[#d1e1e4] focus:bg-white transition-colors text-[#4a4a4a]"
                />
              </div>
              <span className="text-[10px] sm:text-xs text-[#a0a0a0] font-medium uppercase tracking-widest">
                {filteredBooks?.length || 0} Obras encontradas
              </span>
            </div>

            {/* GRID DE LIVROS - Responsivo: 1 col celular, 2 tablet, 3 desktop */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#8a7f72]" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-10">
                {filteredBooks?.map((book, index) => {
                  const dynamicColor = BOOK_COLORS[index % BOOK_COLORS.length];
                  return (
                    <Link href={`/library/${book.id}/principal`} key={book.id} className="block h-full">
                      <div className={`group relative p-6 sm:p-7 h-full min-h-[260px] rounded-2xl border border-black/5 ${dynamicColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden`}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 bg-white/30 backdrop-blur-md -mt-3 rotate-1 shadow-sm" />
                        
                        <div>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-xl flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                            <BookOpen size={20} className="text-[#6a6a6a]" />
                          </div>
                          <h3 className="text-base font-serif font-bold text-[#2a2a2a] leading-tight mb-2">
                            {book.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#5a5a5a] font-serif italic line-clamp-3 leading-relaxed">
                            {book.description || "Sem descrição..."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/10">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#7a6e5f] flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(book.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
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
        <Modal title="Novo Projeto" onClose={() => setIsBookModalOpen(false)}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#7a6e5f] uppercase tracking-widest">Título</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-white border border-[#e0ddd5] rounded-xl text-sm transition-all" 
                placeholder="Ex: O Coração da Montanha" autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#7a6e5f] uppercase tracking-widest">Descrição</label>
              <input 
                type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white border border-[#e0ddd5] rounded-xl text-sm transition-all" 
                placeholder="Uma frase curta..." 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#7a6e5f] uppercase tracking-widest">Resumo</label>
              <textarea 
                rows={3} value={summary} onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 bg-white border border-[#e0ddd5] rounded-xl text-sm resize-none" 
                placeholder="Conte mais sobre a trama..." 
              />
            </div>
            <button 
              onClick={handleCreate} disabled={createBook.isPending}
              className="w-full py-3 bg-[#3a3a3a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {createBook.isPending && <Loader2 size={14} className="animate-spin" />}
              Criar Manuscrito
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL: CÓDIGO */}
      {isCodeModalOpen && (
        <Modal title="Resgatar Convite" onClose={() => setIsCodeModalOpen(false)}>
          <div className="space-y-6 text-center py-2">
            <p className="text-xs sm:text-sm text-[#7a6e5f]">Insira o código enviado pelo autor.</p>
            <input 
              type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full p-4 text-center text-lg font-mono uppercase bg-[#f3f0e9]/50 border-2 border-dashed border-[#c0b5a5] rounded-xl" 
              placeholder="CÓDIGO"
            />
            <button 
              onClick={handleJoin} disabled={joinBook.isPending}
              className="w-full py-3 bg-[#e5ddd3] text-[#4a4a4a] rounded-xl font-bold text-xs uppercase transition-all disabled:opacity-50"
            >
              {joinBook.isPending && <Loader2 size={14} className="animate-spin" />}
              Verificar
            </button>
          </div>
        </Modal>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2a2a2a]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-[#fdfcfb] w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl border border-black/5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e5ddd3] via-[#d1e1e4] to-[#f2ead0]" />
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3a3a3a]">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#f3f0e9] rounded-full transition-colors">
              <X size={16} className="text-[#5a5a5a]" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}