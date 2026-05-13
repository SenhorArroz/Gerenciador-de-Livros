"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

import { 
  List as ListIcon, 
  Plus, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  ListOrdered, 
  List, 
  Quote, 
  Undo, 
  Redo,
  Save,
  Loader2,
  Trash2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown,
  ChevronUp,
  Strikethrough,
  Code
} from "lucide-react";

export default function ChaptersPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const utils = api.useUtils();

  // ==========================================
  // CHAMADAS AO BACKEND (tRPC)
  // ==========================================
  const { data: chapters, isLoading: isChaptersLoading } = api.chapter.getByBookId.useQuery({ bookId });

  const createChapter = api.chapter.create.useMutation({
    onSuccess: (newChapter) => {
      utils.chapter.getByBookId.invalidate();
      setActiveChapterId(newChapter.id); 
      setIsIndexOpenMobile(false);
    },
  });

  const saveContent = api.chapter.saveContent.useMutation({
    onSuccess: () => {
      utils.chapter.getByBookId.invalidate();
      setSaveStatus("Salvo!");
      setTimeout(() => setSaveStatus(""), 2000);
    },
  });

  const updateChapterMeta = api.chapter.update.useMutation({
    onSuccess: () => {
      utils.chapter.getByBookId.invalidate();
    },
  });

  const deleteChapter = api.chapter.delete.useMutation({
    onSuccess: () => {
      utils.chapter.getByBookId.invalidate();
      setActiveChapterId(chapters?.[0]?.id || null);
    },
  });

  // ==========================================
  // ESTADOS
  // ==========================================
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [isIndexOpenMobile, setIsIndexOpenMobile] = useState(false);
  
  const activeChapter = chapters?.find((c) => c.id === activeChapterId);

  // Inicializa o primeiro capítulo se nenhum estiver ativo
  useEffect(() => {
    if (chapters && chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0]?.id ?? "");
    }
  }, [chapters, activeChapterId]);

  // ==========================================
  // CONFIGURAÇÃO DO EDITOR TIPTAP
  // ==========================================
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full text-[16px] md:text-[18px] text-[#4a3e2b] focus:outline-none min-h-[400px] md:min-h-[500px]",
        style: "font-family: 'Lora', serif; line-height: 1.8;"
      }
    }
  });

  // Sincroniza o conteúdo do editor quando a aba muda
  useEffect(() => {
    if (editor && activeChapter && editor.getHTML() !== activeChapter.content) {
      editor.commands.setContent(activeChapter.content || '');
    }
  }, [activeChapterId, activeChapter, editor]);

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const handleAddChapter = () => {
    const nextNumber = chapters ? chapters.length + 1 : 1;
    createChapter.mutate({
      bookId,
      number: `CAPÍTULO ${nextNumber}`,
      shortTitle: `Cap. ${nextNumber}`,
      title: "Novo Capítulo",
    });
  };

  const handleSave = () => {
    if (!activeChapter || !editor) return;
    setSaveStatus("Salvando...");
    saveContent.mutate({
      id: activeChapter.id,
      content: editor.getHTML(),
      status: activeChapter.status, 
    });
  };

  const handleDelete = () => {
    if (!activeChapterId) return;
    if (confirm("Tem certeza que deseja apagar este capítulo?")) {
      deleteChapter.mutate({ id: activeChapterId });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-0 md:gap-8 p-2 md:p-6 overflow-hidden">
      
      {/* ==================================================== */}
      {/* LADO ESQUERDO: ÍNDICE LATERIAL / DROPDOWN MOBILE     */}
      {/* ==================================================== */}
      <div className="w-full md:w-[260px] shrink-0 z-30 flex flex-col">
        
        {/* Toggle Mobile */}
        <button 
          onClick={() => setIsIndexOpenMobile(!isIndexOpenMobile)}
          className="flex md:hidden items-center justify-between w-full p-4 bg-[#f5f0e8] rounded-xl border border-black/5 mb-2 shadow-sm"
        >
          <div className="flex items-center gap-2 font-bold text-[#2c2416]">
            <ListIcon size={18} className="text-[#8e5c3a]" />
            <span>Índice ({chapters?.length || 0})</span>
          </div>
          {isIndexOpenMobile ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Lista de Capítulos */}
        <div className={`${isIndexOpenMobile ? "flex" : "hidden"} md:flex flex-col h-full bg-[#fdfcfb] md:bg-transparent rounded-xl p-2 md:p-0 shadow-xl md:shadow-none min-h-0`}>
          <h2 className="hidden md:flex text-xl font-bold text-[#2c2416] items-center gap-2 mb-6" style={{ fontFamily: "'Lora', serif" }}>
            <ListIcon size={20} className="text-[#8e5c3a]" /> Índice
          </h2>
          
          {isChaptersLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8e5c3a]" /></div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[50vh] md:max-h-full pr-1 pb-4">
              {chapters?.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                const statusColor = chapter.status === "Rascunho" ? "bg-gray-400" : chapter.status === "Revisão" ? "bg-orange-400" : "bg-green-500";

                return (
                  <div 
                    key={chapter.id}
                    onClick={() => { setActiveChapterId(chapter.id); setIsIndexOpenMobile(false); }}
                    className={`relative p-3 md:p-4 rounded-xl cursor-pointer transition-all border ${
                      isActive ? "bg-white border-[#e0ddd5] shadow-sm ring-1 ring-black/5" : "bg-transparent border-transparent hover:bg-[#f5f0e8]/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-[#b5a89a] uppercase tracking-widest block">{chapter.number}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} title={chapter.status} />
                    </div>
                    <h3 className={`text-sm font-semibold leading-tight ${isActive ? "text-[#2c2416]" : "text-[#7a6e5f]"}`} style={{ fontFamily: "'Lora', serif" }}>
                      {chapter.title}
                    </h3>
                  </div>
                );
              })}

              <button 
                onClick={handleAddChapter}
                disabled={createChapter.isPending}
                className="mt-2 w-full py-3 border-2 border-dashed border-[#b4a07866] rounded-xl text-[#b5a89a] hover:bg-[#f5f0e8]/50 hover:text-[#8e5c3a] transition-all flex items-center justify-center gap-2 text-xs font-bold"
              >
                {createChapter.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                NOVO CAPÍTULO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* LADO DIREITO: EDITOR TIPTAP (FOLHA DE CADERNO)       */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 mt-2 md:mt-0">
        
        {!activeChapter ? (
          <div className="flex-1 flex items-center justify-center text-[#b5a89a] italic text-center p-8 bg-black/[0.02] rounded-2xl border-2 border-dashed border-black/5" style={{ fontFamily: "'Caveat', cursive", fontSize: "24px" }}>
            Selecione um capítulo no índice para começar a escrever...
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden shadow-sm md:shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#e8e4db] rounded-2xl">
            
            {/* TOOLBAR RESPONSIVA */}
            <div className="bg-[#faf8f5] border-b border-[#e8e4db] shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between z-10">
              
              {/* Scroll de ferramentas no celular */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-3 py-2 sm:py-3 border-b sm:border-b-0 border-[#e8e4db]/50">
                
                {/* Formatação Básica */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-0.5 shrink-0 shadow-sm">
                  <ToolbarBtn icon={Bold} onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrito" />
                  <ToolbarBtn icon={Italic} onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Itálico" />
                  <ToolbarBtn icon={UnderlineIcon} onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Sublinhado" />
                  <ToolbarBtn icon={Strikethrough} onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Tachado" />
                </div>

                {/* Títulos e Parágrafos */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-0.5 shrink-0 shadow-sm">
                  <ToolbarBtn icon={Type} onClick={() => editor?.chain().focus().setParagraph().run()} active={editor?.isActive('paragraph')} title="Texto Normal" />
                  <ToolbarBtn icon={Heading1} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="Título 1" />
                  <ToolbarBtn icon={Heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Título 2" />
                  <ToolbarBtn icon={Heading3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Título 3" />
                </div>

                {/* Alinhamentos */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-0.5 shrink-0 shadow-sm">
                  <ToolbarBtn icon={AlignLeft} onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} />
                  <ToolbarBtn icon={AlignCenter} onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} />
                  <ToolbarBtn icon={AlignRight} onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} />
                  <ToolbarBtn icon={AlignJustify} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} active={editor?.isActive({ textAlign: 'justify' })} />
                </div>

                {/* Listas e Extras */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-0.5 shrink-0 shadow-sm">
                  <ToolbarBtn icon={List} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} />
                  <ToolbarBtn icon={ListOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} />
                  <ToolbarBtn icon={Quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} />
                  <ToolbarBtn icon={Code} onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} />
                </div>

                {/* Histórico */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-0.5 shrink-0 shadow-sm">
                  <ToolbarBtn icon={Undo} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} />
                  <ToolbarBtn icon={Redo} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} />
                </div>
              </div>

              {/* Botões de Ação Final (Salvar/Excluir) */}
              <div className="flex items-center justify-end gap-3 px-4 py-2 sm:py-3 bg-[#f5f0e8]/30 sm:bg-transparent shrink-0">
                <span className="text-[10px] font-bold text-[#8e5c3a] uppercase">{saveStatus}</span>
                
                <button 
                  onClick={handleDelete} 
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" 
                  title="Apagar Capítulo"
                >
                  <Trash2 size={16} />
                </button>

                <button 
                  onClick={handleSave} 
                  disabled={saveContent.isPending}
                  className="flex items-center gap-2 bg-[#2c2416] text-[#f5f0e8] px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-[#4a3e2b] transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {saveContent.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar
                </button>
              </div>
            </div>

            {/* ÁREA DE ESCRITA (FOLHA DE PAPEL) */}
            <div className="flex-1 overflow-y-auto bg-[#faf8f5] px-4 sm:px-12 md:px-20 py-8 md:py-12 lined-paper-bg relative min-h-0 custom-scrollbar">
              <div className="max-w-[750px] mx-auto">
                
                {/* Metadados Editáveis */}
                <div className="flex justify-between items-center mb-6 border-b border-[#e8e4db] pb-2">
                  <input 
                    type="text"
                    defaultValue={activeChapter.shortTitle}
                    onBlur={(e) => updateChapterMeta.mutate({ id: activeChapter.id, shortTitle: e.target.value })}
                    className="bg-transparent border-none focus:outline-none text-[#a09586] text-lg md:text-[22px] w-[120px] md:w-[150px] placeholder:text-[#d1c8b8]"
                    style={{ fontFamily: "'Caveat', cursive" }}
                    title="Editar Nome Curto"
                  />
                  
                  <select 
                    defaultValue={activeChapter.status}
                    onChange={(e) => updateChapterMeta.mutate({ id: activeChapter.id, status: e.target.value })}
                    className="bg-transparent border-none focus:outline-none text-[#a09586] text-lg md:text-[22px] appearance-none cursor-pointer text-right"
                    style={{ fontFamily: "'Caveat', cursive" }}
                    title="Alterar Status"
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Revisão">Revisão</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                {/* Título Principal */}
                <input 
                  type="text"
                  defaultValue={activeChapter.title}
                  key={`title-${activeChapter.id}`} 
                  onBlur={(e) => updateChapterMeta.mutate({ id: activeChapter.id, title: e.target.value })}
                  className="w-full text-[28px] md:text-[36px] font-bold text-[#2c2416] bg-transparent border-none focus:outline-none mb-6 placeholder:text-[#d1c8b8]"
                  style={{ fontFamily: "'Lora', serif", lineHeight: "1.2" }}
                  placeholder="Título do Capítulo..."
                />

                {/* TIPTAP EDITOR */}
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .lined-paper-bg {
          background-image: repeating-linear-gradient(transparent, transparent 31px, #e5e0d8 31px, #e5e0d8 32px);
          background-position: 0 10px;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Tiptap Core Styles */
        .tiptap p.is-editor-empty:first-child::before {
          color: #d1c8b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .tiptap p { margin-bottom: 1rem; }
        .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .tiptap blockquote { 
          border-left: 3px solid #8e5c3a; 
          padding-left: 1rem; 
          font-style: italic; 
          color: #7a6e5f;
          margin: 1rem 0;
        }
        .tiptap code {
          background-color: #eaddce;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        .tiptap h1 {
          font-size: 28px;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #2c2416;
        }
        .tiptap h2 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #4a3e2b;
        }
        .tiptap h3 {
          font-size: 18px;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #7a6e5f;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1c8b8; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function ToolbarBtn({ icon: Icon, active = false, onClick, disabled = false, title }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 md:p-2 rounded-md transition-colors shrink-0 ${
        active ? "bg-[#eaddce] text-[#8e5c3a]" : "text-[#7a6e5f] hover:bg-[#f5f0e8] hover:text-[#2c2416]"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />
    </button>
  );
}