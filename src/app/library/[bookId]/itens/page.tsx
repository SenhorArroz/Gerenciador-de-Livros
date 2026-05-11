"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { 
  Box, Search, Plus, X, User, MapPin, Sparkles, Tag, Save, 
  MoreHorizontal, Pencil, Trash2, Loader2 
} from "lucide-react";

// Tipagem baseada no Prisma
type Item = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  relatedTo: string | null;
  origin: string | null;
  bookId: string;
};

export default function ItemsPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const utils = api.useUtils();

  // ==========================================
  // CHAMADAS AO BACKEND (tRPC)
  // ==========================================
  const { data: items, isLoading: isItemsLoading } = api.item.getByBookId.useQuery({ bookId });
  
  // NOVA CHAMADA: Busca os personagens deste livro para o dropdown
  const { data: characters } = api.character.getByBookId.useQuery({ bookId });

  const createItem = api.item.create.useMutation({
    onSuccess: () => {
      utils.item.getByBookId.invalidate();
      setIsModalOpen(false);
    },
  });

  const updateItem = api.item.update.useMutation({
    onSuccess: () => {
      utils.item.getByBookId.invalidate();
      setIsModalOpen(false);
    },
  });

  const deleteItem = api.item.delete.useMutation({
    onSuccess: () => {
      utils.item.getByBookId.invalidate();
    },
  });

  // ==========================================
  // ESTADOS DA UI
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Estados do Modal
  const [formData, setFormData] = useState({
    name: "",
    category: "Artefato", // Ajustado para bater com o primeiro <option> em português
    description: "",
    relatedTo: "",
    origin: "",
  });

  // Filtro de busca
  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abre modal para CRIAR
  const handleOpenModal = () => {
    setEditingItemId(null);
    setFormData({ name: "", category: "Artefato", description: "", relatedTo: "", origin: "" });
    setIsModalOpen(true);
  };

  // Abre modal para EDITAR
  const handleEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || "",
      relatedTo: item.relatedTo || "",
      origin: item.origin || "",
    });
    setIsModalOpen(true);
  };

  // Salva (Cria ou Atualiza)
  const handleSaveItem = () => {
    if (!formData.name.trim()) return;

    const payload = {
      bookId,
      name: formData.name,
      category: formData.category,
      description: formData.description || undefined,
      relatedTo: formData.relatedTo || undefined,
      origin: formData.origin || undefined,
    };

    if (editingItemId) {
      updateItem.mutate({ id: editingItemId, ...payload });
    } else {
      createItem.mutate(payload);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col relative">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 pr-2">
        <h1
          className="text-[30px] font-bold text-[#2c2416] leading-tight flex items-center gap-3"
          style={{ fontFamily: "'Lora', serif" }}
        >
          <Box size={24} className="text-[#5a5a5a]" strokeWidth={1.5} />
          Itens & Artefatos
        </h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[220px] h-[40px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5a89a]" size={16} />
            <input 
              type="text" 
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full pl-9 pr-3 bg-[#fdfcfb] border border-[#d1c8b8] rounded-md text-[13px] text-[#2c2416] placeholder:text-[#b5a89a] focus:outline-none focus:border-[#8e5c3a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
            />
          </div>

          <button 
            onClick={handleOpenModal}
            className="h-[40px] px-5 bg-[#2c2416] text-[#f5f0e8] rounded-md flex items-center gap-2 hover:bg-[#4a3e2b] shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus size={16} />
            <span className="text-[17px] tracking-wide mt-0.5" style={{ fontFamily: "'Caveat', cursive" }}>
              Novo Item
            </span>
          </button>
        </div>
      </div>

      <div className="w-full border-t border-[#d1c8b8] opacity-50 mb-8" />

      {/* LOADING */}
      {isItemsLoading && (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-[#8e5c3a]" size={32} />
        </div>
      )}

      {/* GRID DE ITENS */}
      {!isItemsLoading && (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {filteredItems?.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEditItem(item)}
                onDelete={() => deleteItem.mutate({ id: item.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#2c2416]/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-[#fcfaf7] w-full max-w-2xl rounded-xl border border-[#b4a078] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-[#eaddce] to-[#d5c8b5]" />

            <div className="p-8 pl-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#2c2416] flex items-center gap-2 mb-1" style={{ fontFamily: "'Lora', serif" }}>
                    <Sparkles size={20} className="text-[#8e5c3a]" />
                    {editingItemId ? "Editar Artefato" : "Registrar Artefato"}
                  </h2>
                  <p className="text-[#7a6e5f] text-sm" style={{ fontFamily: "'Caveat', cursive" }}>
                    Crie e descreva um novo objeto neste universo...
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full text-[#a09586] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
                
                {/* Nome do Item */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Nome do Item</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-lg bg-black/5 border border-transparent focus:bg-white focus:border-[#8e5c3a] text-[#2c2416] transition-colors outline-none"
                    autoFocus
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Tag size={12} /> Categoria
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-lg bg-black/5 border border-transparent focus:bg-white focus:border-[#8e5c3a] text-[#2c2416] transition-colors outline-none appearance-none"
                  >
                    <option value="Artefato">Artefato Mágico</option>
                    <option value="Arma">Arma</option>
                    <option value="Documento">Documento / Livro</option>
                    <option value="Consumível">Consumível</option>
                    <option value="Relíquia">Relíquia</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {/* Relacionado A (DROPDOWN DINÂMICO) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1 flex items-center gap-1">
                    <User size={12} /> Pertence A
                  </label>
                  <select
                    value={formData.relatedTo}
                    onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-lg bg-black/5 border border-transparent focus:bg-white focus:border-[#8e5c3a] text-[#2c2416] transition-colors outline-none appearance-none"
                  >
                    <option value="">Nenhum (Item Solto)</option>
                    {/* Renderiza a lista de personagens vindos do banco de dados */}
                    {characters?.map((char) => (
                      <option key={char.id} value={char.name}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Origem */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1 flex items-center gap-1">
                    <MapPin size={12} /> Origem / Localização (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-lg bg-black/5 border border-transparent focus:bg-white focus:border-[#8e5c3a] text-[#2c2416] transition-colors outline-none"
                  />
                </div>

                {/* Descrição */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-[100px] p-4 rounded-lg bg-black/5 border border-transparent focus:bg-white focus:border-[#8e5c3a] resize-none text-[15px] text-[#2c2416] leading-relaxed transition-colors outline-none"
                    style={{ fontFamily: "'Lora', serif" }}
                  />
                </div>

                {/* Botões do Formulário */}
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-[44px] border border-[#d1c8b8] text-[#7a6e5f] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={createItem.isPending || updateItem.isPending}
                    className="flex-1 h-[44px] flex items-center justify-center gap-2 bg-[#2c2416] text-[#f5f0e8] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#4a3e2b] transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {(createItem.isPending || updateItem.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Guardar no Inventário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUBCOMPONENTE: CARD DO ITEM
// ==========================================
function ItemCard({ item, onEdit, onDelete }: { item: Item; onEdit: () => void; onDelete: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      className="relative bg-white p-6 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#e8e4db] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px] flex flex-col overflow-visible"
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      {/* DETALHE GRÁFICO: Círculo Rosa - Fiel à imagem */}
      {/* Correção Tailwind: w-25 h-25 não existem por padrão, alterado para w-24 h-24 */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#fce4ec] rounded-bl-full rounded-tr-lg z-0 opacity-80 overflow-hidden" />
      
      {/* ETIQUETA AMARELA (Tape) */}
      <div 
        className="absolute top-5 right-2 bg-[#fdf3a7] text-[#b08d40] text-[13px] px-2.5 py-0.5 rotate-[10deg] shadow-sm z-10 truncate max-w-[120px]"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        {item.category}
      </div>

      {/* MENU 3 PONTOS */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 rounded-full text-[#b5a89a] hover:text-[#2c2416] hover:bg-black/5 transition-colors focus:outline-none"
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Dropdown do Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-[#e8e4db] py-1 animate-in fade-in zoom-in-95">
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

      {/* TÍTULO DO ITEM */}
      <h3 
        className="text-[20px] font-bold text-[#2c2416] leading-tight mb-5 pr-12 mt-6 relative z-10" 
        style={{ fontFamily: "'Lora', serif" }}
      >
        {item.name}
      </h3>

      {/* DESCRIÇÃO EM ITÁLICO E ASPAS */}
      <p 
        className="text-[15px] text-[#7a6e5f] italic leading-relaxed flex-1 relative z-10 mb-6"
        style={{ fontFamily: "'Lora', serif" }}
      >
        "{item.description || <span className="opacity-50">Sem descrição...</span>}"
      </p>

      {/* ÁREA DE RELAÇÕES */}
      <div className="pt-4 border-t border-[#f0eee9] relative z-10 mt-auto">
        <span className="block text-[9px] font-bold text-[#b5a89a] uppercase tracking-widest mb-2.5">
          Relacionado a
        </span>
        
        <div className="flex flex-wrap gap-2">
          {item.relatedTo ? (
            <span className="inline-flex items-center px-3 py-1 bg-[#f5f0e8] border border-[#e0ddd5] rounded-full text-[12px] text-[#5a5a5a]">
              {item.relatedTo}
            </span>
          ) : (
            <span className="text-xs text-[#d1c8b8] italic">Sem vínculo.</span>
          )}
        </div>
      </div>
    </div>
  );
}