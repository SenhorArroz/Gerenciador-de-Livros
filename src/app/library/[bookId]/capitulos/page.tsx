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
  Heading3
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
  
  const activeChapter = chapters?.find((c) => c.id === activeChapterId);

  useEffect(() => {
    if (chapters && chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

  // ==========================================
  // CONFIGURAÇÃO DO EDITOR TIPTAP
  // ==========================================
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3], // Habilita H1, H2 e H3
        },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "w-full text-[18px] text-[#4a3e2b] focus:outline-none min-h-[500px]",
        style: "font-family: 'Lora', serif; line-height: 32px;"
      }
    }
  });

  // Preenche o editor quando a aba muda
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
    if (confirm("Tem certeza que deseja apagar este capítulo?")) {
      deleteChapter.mutate({ id: activeChapterId! });
    }
  };

  // Função para mudar cabeçalhos e parágrafo
  const toggleHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const setParagraph = () => {
    editor?.chain().focus().setParagraph().run();
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col md:flex-row gap-8 relative">
      
      {/* ==================================================== */}
      {/* LADO ESQUERDO: ÍNDICE LATERIAL                        */}
      {/* ==================================================== */}
      <div className="w-full md:w-[280px] shrink-0 flex flex-col h-full border-r border-black/5 pr-6">
        
        <h2 className="text-[22px] font-bold text-[#2c2416] flex items-center gap-2 mb-4" style={{ fontFamily: "'Lora', serif" }}>
          <ListIcon size={20} className="text-[#8e5c3a]" />
          Índice
        </h2>
        <div className="h-px w-12 bg-[#8e5c3a] opacity-30 mb-6" />

        {isChaptersLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8e5c3a]" /></div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-4 pr-2">
            {chapters?.map((chapter) => {
              const isActive = chapter.id === activeChapterId;
              const statusColor = chapter.status === "Rascunho" ? "bg-gray-400" : chapter.status === "Revisão" ? "bg-orange-400" : "bg-green-500";

              return (
                <div 
                  key={chapter.id}
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group
                    ${isActive ? "bg-white border border-[#e0ddd5] shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : "hover:bg-[#f5f0e8]/50 border border-transparent"}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#2c2416] rounded-r-md" />}

                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-[#b5a89a] uppercase tracking-widest">{chapter.number}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColor} shadow-sm`} title={chapter.status} />
                  </div>
                  
                  <h3 className={`text-[15px] font-semibold leading-tight ${isActive ? "text-[#2c2416]" : "text-[#7a6e5f]"}`} style={{ fontFamily: "'Lora', serif" }}>
                    {chapter.title}
                  </h3>
                </div>
              );
            })}

            <button 
              onClick={handleAddChapter}
              disabled={createChapter.isPending}
              className="mt-2 w-full py-4 bg-transparent border-2 border-dashed border-[#b4a07866] rounded-xl text-[#b5a89a] hover:bg-[#f5f0e8]/50 hover:text-[#8e5c3a] transition-all flex items-center justify-center gap-2 text-[13px] font-medium"
            >
              {createChapter.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Adicionar Capítulo
            </button>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* LADO DIREITO: EDITOR TIPTAP (FOLHA DE CADERNO)       */}
      {/* ==================================================== */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative px-2 pb-12 pt-2">
        
        {!activeChapter ? (
           <div className="h-full flex items-center justify-center text-[#b5a89a] italic" style={{ fontFamily: "'Caveat', cursive", fontSize: "24px" }}>
             Selecione ou crie um capítulo para começar a escrever...
           </div>
        ) : (
          <div className="relative w-full max-w-[800px] mx-auto bg-[#faf8f5] shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-sm border border-[#e8e4db] min-h-[800px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/50 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-20" />

            {/* TOOLBAR DO EDITOR */}
            <div className="sticky top-0 z-10 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4db] px-8 py-3 flex flex-wrap items-center justify-between gap-4 rounded-t-sm">
              
              <div className="flex gap-4">
                {/* Formatação de Texto Básica */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-1 shadow-sm">
                  <ToolbarBtn icon={Bold} onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrito (Ctrl+B)" />
                  <ToolbarBtn icon={Italic} onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Itálico (Ctrl+I)" />
                  <ToolbarBtn icon={UnderlineIcon} onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Sublinhado (Ctrl+U)" />
                </div>

                {/* Tamanhos / Títulos */}
                <div className="flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-1 shadow-sm">
                  <ToolbarBtn icon={Type} onClick={setParagraph} active={editor?.isActive('paragraph')} title="Texto Normal" />
                  <ToolbarBtn icon={Heading1} onClick={() => toggleHeading(1)} active={editor?.isActive('heading', { level: 1 })} title="Título Principal" />
                  <ToolbarBtn icon={Heading2} onClick={() => toggleHeading(2)} active={editor?.isActive('heading', { level: 2 })} title="Subtítulo" />
                  <ToolbarBtn icon={Heading3} onClick={() => toggleHeading(3)} active={editor?.isActive('heading', { level: 3 })} title="Tópico Menor" />
                </div>

                {/* Alinhamento */}
                <div className="hidden lg:flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-1 shadow-sm">
                  <ToolbarBtn icon={AlignLeft} onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} />
                  <ToolbarBtn icon={AlignCenter} onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} />
                  <ToolbarBtn icon={AlignRight} onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} />
                  <ToolbarBtn icon={AlignJustify} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} active={editor?.isActive({ textAlign: 'justify' })} />
                </div>

                {/* Listas */}
                <div className="hidden xl:flex items-center gap-1 bg-white border border-[#e0ddd5] rounded-lg p-1 shadow-sm">
                  <ToolbarBtn icon={List} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} />
                  <ToolbarBtn icon={ListOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} />
                  <ToolbarBtn icon={Quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} />
                </div>
              </div>

              {/* Ações Finais */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-2 text-[#b5a89a]">
                  <ToolbarBtn icon={Undo} onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Desfazer" />
                  <ToolbarBtn icon={Redo} onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Refazer" />
                </div>
                
                <span className="text-[11px] font-bold text-[#8e5c3a] uppercase tracking-widest mr-2">{saveStatus}</span>
                
                <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Apagar Capítulo">
                  <Trash2 size={16} />
                </button>

                <button 
                  onClick={handleSave} 
                  disabled={saveContent.isPending}
                  className="flex items-center gap-2 bg-[#2c2416] text-[#f5f0e8] px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-[#4a3e2b] transition-colors shadow-sm disabled:opacity-50"
                >
                  {saveContent.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Salvar
                </button>
              </div>
            </div>

            {/* ÁREA DE ESCRITA */}
            <div className="relative flex-1 px-12 md:px-20 py-10 lined-paper-bg">
              
              {/* Metadados Editáveis (Cabeçalho da Folha) */}
              <div className="flex justify-between items-center mb-8 border-b border-[#e8e4db] pb-2">
                {/* Input para Editar o Nome Curto (Ex: Cap. 1) */}
                <input 
                  type="text"
                  defaultValue={activeChapter.shortTitle}
                  onBlur={(e) => updateChapterMeta.mutate({ id: activeChapter.id, shortTitle: e.target.value })}
                  className="bg-transparent border-none focus:outline-none text-[#a09586] text-[22px] w-[150px] placeholder:text-[#d1c8b8]"
                  style={{ fontFamily: "'Caveat', cursive" }}
                  title="Editar Nome Curto"
                />
                
                {/* Select para Editar o Status */}
                <select 
                  defaultValue={activeChapter.status}
                  onChange={(e) => updateChapterMeta.mutate({ id: activeChapter.id, status: e.target.value })}
                  className="bg-transparent border-none focus:outline-none text-[#a09586] text-[22px] appearance-none cursor-pointer text-right"
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
                className="w-full text-[36px] font-bold text-[#2c2416] bg-transparent border-none focus:outline-none mb-6 placeholder:text-[#d1c8b8]"
                style={{ fontFamily: "'Lora', serif", lineHeight: "1.2" }}
                placeholder="Título do Capítulo..."
              />

              {/* TIPTAP EDITOR CONTENT */}
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .lined-paper-bg {
          background-image: repeating-linear-gradient(transparent, transparent 31px, #e5e0d8 31px, #e5e0d8 32px);
          background-position: 0 10px;
        }

        /* Classes essenciais do Tiptap */
        .tiptap p.is-editor-empty:first-child::before {
          color: #d1c8b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .tiptap ul { list-style-type: disc; padding-left: 20px; }
        .tiptap ol { list-style-type: decimal; padding-left: 20px; }
        .tiptap blockquote { 
          border-left: 3px solid #8e5c3a; 
          padding-left: 1rem; 
          font-style: italic; 
          color: #7a6e5f;
          margin: 1rem 0;
        }

        /* Estilização para H1, H2 e H3 do Tiptap baterem com o visual do caderno */
        .tiptap h1 {
          font-size: 28px;
          font-weight: 700;
          margin-top: 1.5rem;
          color: #2c2416;
        }
        .tiptap h2 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 1rem;
          color: #4a3e2b;
        }
        .tiptap h3 {
          font-size: 18px;
          font-weight: 600;
          margin-top: 0.5rem;
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
      className={`p-1.5 rounded-md transition-colors ${
        active ? "bg-[#eaddce] text-[#8e5c3a]" : "text-[#7a6e5f] hover:bg-[#f5f0e8] hover:text-[#2c2416]"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}