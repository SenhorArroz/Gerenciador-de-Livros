"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Plus, MoreHorizontal, Pencil, Trash2, X, Save, StickyNote, Loader2 } from "lucide-react";

// Tipagens
type NoteColor = "yellow" | "blue" | "pink" | "green";

type Note = {
  id: string;
  title: string;
  description: string;
  color: string;
  rotation: string;
};

// Paleta de Cores
const colors: Record<NoteColor, string> = {
  yellow: "bg-[#fdf3a7]",
  blue:   "bg-[#cce3f9]",
  pink:   "bg-[#f9d8e8]",
  green:  "bg-[#d1f0d1]",
};

const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

export default function NotesBoardPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const utils = api.useUtils();

  // ==========================================
  // CHAMADAS AO BACKEND (tRPC)
  // ==========================================
  const { data: notes, isLoading } = api.note.getByBookId.useQuery({ bookId });

  const createNote = api.note.create.useMutation({
    onSuccess: () => {
      utils.note.getByBookId.invalidate();
      setIsModalOpen(false);
    },
  });

  const updateNote = api.note.update.useMutation({
    onSuccess: () => {
      utils.note.getByBookId.invalidate();
      setIsModalOpen(false);
    },
  });

  const deleteNote = api.note.delete.useMutation({
    onSuccess: () => {
      utils.note.getByBookId.invalidate();
    },
  });

  // ==========================================
  // ESTADOS DA UI E FORMULÁRIO
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalColor, setModalColor] = useState<NoteColor>("yellow");

  // Abre o modal para CRIAR
  const openCreateModal = (color: NoteColor) => {
    setEditingNote(null);
    setModalTitle("");
    setModalDescription("");
    setModalColor(color);
    setIsModalOpen(true);
  };

  // Abre o modal para EDITAR
  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setModalTitle(note.title);
    setModalDescription(note.description);
    setModalColor(note.color as NoteColor);
    setIsModalOpen(true);
  };

  // Salva a nota (cria ou atualiza no BD)
  const handleSaveNote = () => {
    if (!modalTitle.trim() && !modalDescription.trim()) return;

    if (editingNote) {
      updateNote.mutate({
        id: editingNote.id,
        title: modalTitle || "Sem Título",
        description: modalDescription,
        color: modalColor,
      });
    } else {
      createNote.mutate({
        bookId,
        title: modalTitle || "Sem Título",
        description: modalDescription,
        color: modalColor,
        // Sorteia a rotação apenas na criação e salva no banco
        rotation: rotations[Math.floor(Math.random() * rotations.length)],
      });
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col relative">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between mb-4 pr-2">
        <h1
          className="text-[32px] font-bold text-[#2c2416] leading-tight"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Quadro de Ideias
        </h1>

        <div className="flex items-center gap-2 bg-[#f5f0e8]/60 border border-[#e0ddd5] rounded-full p-1.5 shadow-inner">
          {(Object.keys(colors) as NoteColor[]).map((color) => (
            <button
              key={color}
              onClick={() => openCreateModal(color)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${colors[color]} border border-black/10 shadow-sm`}
              title={`Nova anotação ${color}`}
            >
              <Plus size={14} className="text-[#5a5a5a] opacity-60" />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full border-t-[2.5px] border-dashed border-[#d1c8b8] opacity-60 mb-8" />

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-[#8e5c3a]" size={32} />
        </div>
      )}

      {/* ÁREA DO QUADRO - MASONRY LAYOUT */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 pr-2">
          {notes?.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center opacity-50">
              <p className="text-[#a09586] text-xl" style={{ fontFamily: "'Caveat', cursive" }}>
                Nenhuma ideia fixada ainda. Clique em uma cor acima...
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-6">
              {notes?.map((note) => (
                <PostItCard 
                  key={note.id} 
                  note={note} 
                  onEdit={() => openEditModal(note)} 
                  onDelete={() => deleteNote.mutate({ id: note.id })} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#2c2416]/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-[#fcfaf7] w-full max-w-lg rounded-xl border border-[#b4a078] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-3 ${colors[modalColor]} border-b border-black/5 transition-colors`} />
            
            <div className="p-6 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#2c2416] flex items-center gap-2" style={{ fontFamily: "'Lora', serif" }}>
                  <StickyNote size={18} className="text-[#8e5c3a]" />
                  {editingNote ? "Editar Anotação" : "Nova Anotação"}
                </h2>
                
                <div className="flex gap-1.5">
                  {(Object.keys(colors) as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setModalColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${colors[c]} ${modalColor === c ? "border-[#8e5c3a] scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Título</label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="Um título curto e direto..."
                    className="w-full px-4 py-3 rounded-lg bg-black/5 border border-black/5 focus:outline-none focus:border-[#8e5c3a] text-[#2c2416] font-semibold transition-colors"
                    style={{ fontFamily: "'Lora', serif" }}
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Descrição</label>
                  <textarea
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Desenvolva sua ideia aqui..."
                    className="w-full h-32 px-4 py-3 rounded-lg bg-black/5 border border-black/5 focus:outline-none focus:border-[#8e5c3a] resize-none text-[17px] text-[#2c2416] leading-relaxed transition-colors"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-[#7a6e5f] hover:bg-black/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={createNote.isPending || updateNote.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2c2416] text-[#f5f0e8] py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#4a3e2b] transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {(createNote.isPending || updateNote.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUBCOMPONENTE: POST-IT CARD
// ==========================================
function PostItCard({ note, onEdit, onDelete }: { note: Note; onEdit: () => void; onDelete: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      className={`
        break-inside-avoid mb-6 relative group p-6 rounded-sm flex flex-col h-fit
        ${colors[note.color as NoteColor]} ${note.rotation}
        shadow-[3px_4px_10px_rgba(0,0,0,0.08)] hover:shadow-[4px_6px_15px_rgba(0,0,0,0.12)] transition-all duration-300
        border border-black/5 animate-in zoom-in-95
      `}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-black/5 to-transparent rounded-t-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-black/10 to-transparent rounded-tl-full rounded-br-sm pointer-events-none" />

      {/* MENU 3 PONTOS */}
      <div className="absolute top-3 right-3 z-10">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 rounded-full text-[#5a5a5a] hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontal size={18} />
        </button>

        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-black/10 py-1 animate-in fade-in zoom-in-95">
            <button 
              onClick={() => { setIsMenuOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#4a3e2b] hover:bg-[#f5f0e8] transition-colors"
            >
              <Pencil size={14} /> Editar
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>

      <h3 
        className="text-[18px] font-bold text-[#2c2416] leading-tight mb-2 pr-6" 
        style={{ fontFamily: "'Lora', serif" }}
      >
        {note.title}
      </h3>

      <p 
        className="text-[16px] text-[#4a3e2b] leading-relaxed whitespace-pre-wrap pb-2"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        {note.description}
      </p>
    </div>
  );
}