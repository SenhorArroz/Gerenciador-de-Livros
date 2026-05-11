"use client";

import {
  MapPin,
  Search,
  Plus,
  X,
  Camera,
  Map,
  Cloud,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useUploadThing } from "../../../../utils/uploadthing"; 

type Place = {
  id: string;
  name: string;
  importance: string;
  region: string | null;
  atmosphere: string | null;
  description: string | null;
  imageUrl: string | null;
  bookId: string;
};

export default function PlacesPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const utils = api.useUtils();

  // ==========================================
  // CHAMADAS AO BACKEND (tRPC)
  // ==========================================
  const { data: places, isLoading } = api.place.getByBookId.useQuery({ bookId });

  const createPlace = api.place.create.useMutation({
    onSuccess: () => {
      utils.place.getByBookId.invalidate();
      handleCloseModal();
    },
  });

  const updatePlace = api.place.update.useMutation({
    onSuccess: () => {
      utils.place.getByBookId.invalidate();
      handleCloseModal();
    },
  });

  const deletePlace = api.place.delete.useMutation({
    onSuccess: () => { utils.place.getByBookId.invalidate(); },
  });

  // ==========================================
  // ESTADOS DO FORMULÁRIO E UPLOAD
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", importance: "MEDIUM", region: "", atmosphere: "", description: "",
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // 👇 NOVO: Guarda o arquivo real selecionado pelo usuário
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 NOVO: Hook manual do UploadThing
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const filteredPlaces = places?.filter(
    (place) =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.region && place.region.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ name: "", importance: "MEDIUM", region: "", atmosphere: "", description: "" });
    setPhotoPreview(null);
    setSelectedFile(null); // Reseta o arquivo
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (place: Place) => {
    setEditingId(place.id);
    setFormData({
      name: place.name, importance: place.importance,
      region: place.region || "", atmosphere: place.atmosphere || "", description: place.description || "",
    });
    setPhotoPreview(place.imageUrl);
    setSelectedFile(null); // Reseta o arquivo
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setPhotoPreview(null);
      setSelectedFile(null);
      setFormData({ name: "", importance: "MEDIUM", region: "", atmosphere: "", description: "" });
    }, 300);
  };

  // 👇 Lida apenas com o Preview visual (gera o blob) e guarda o arquivo no estado
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); 
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  // 👇 handleSave agora é ASSÍNCRONO!
  const handleSave = async () => {
    if (!formData.name.trim()) return;

    // Se não houver arquivo novo selecionado, mantemos a URL antiga (se existir)
    let finalImageUrl = photoPreview;

    // Se o usuário selecionou uma FOTO NOVA, fazemos o upload AGORA
    if (selectedFile) {
      const uploadedFiles = await startUpload([selectedFile]);
      
      // Se o upload der sucesso, substituímos o Blob pela URL real da AWS S3
      if (uploadedFiles && uploadedFiles[0]) {
        finalImageUrl = uploadedFiles[0].url;
      } else {
        alert("Falha ao enviar a imagem. Tente novamente.");
        return; // Interrompe o salvamento se a foto falhar
      }
    }

    // Agora sim, enviamos os dados pro seu banco Postgres (tRPC)
    const payload = {
      bookId,
      name: formData.name,
      importance: formData.importance,
      region: formData.region || undefined,
      atmosphere: formData.atmosphere || undefined,
      description: formData.description || undefined,
      imageUrl: finalImageUrl || undefined, // Mandamos a URL real aqui!
    };

    if (editingId) {
      updatePlace.mutate({ id: editingId, ...payload });
    } else {
      createPlace.mutate(payload);
    }
  };

  // Calcula se algo está carregando para bloquear o botão de salvar
  const isPending = createPlace.isPending || updatePlace.isPending || isUploading;

  return (
    <div className="p-2 relative h-full flex flex-col">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-end mb-1">
        <h1 className="text-[32px] font-bold text-[#2c2416] leading-tight flex items-center gap-3" style={{ fontFamily: "'Lora', serif" }}>
          <MapPin size={26} className="text-[#8e5c3a]" />
          Lugares & Cenários
        </h1>
        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-[#2c2416] text-[#f5f0e8] rounded-lg text-[14px] shadow-sm active:scale-95 transition-all" style={{ fontFamily: "'Caveat', cursive" }}>
          <Plus size={16} /> Novo Local
        </button>
      </div>

      <div className="h-px bg-[#8e5c3a] opacity-30 my-4" />

      {/* BUSCA */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5a89a]" size={16} />
          <input type="text" placeholder="Buscar nos mapas e registros..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#f5f0e8]/50 border border-[#b4a07866] rounded-xl text-[14px] text-[#2c2416] focus:outline-none focus:border-[#8e5c3a] transition-colors shadow-inner" style={{ fontFamily: "'Lora', serif" }} />
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-[#8e5c3a]" size={32} />
        </div>
      )}

      {/* GRID */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pb-10 custom-scrollbar pr-2 items-start">
          {filteredPlaces?.map((place) => (
            <PlaceCard key={place.id} place={place} onEdit={() => handleOpenEditModal(place)} onDelete={() => deletePlace.mutate({ id: place.id })} />
          ))}

          <button onClick={handleOpenCreateModal} className="group flex flex-col items-center justify-center min-h-[260px] bg-[#f5f0e8]/30 border-2 border-dashed border-[#b4a07866] rounded-sm hover:bg-[#f5f0e8]/80 hover:border-[#8e5c3a]/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#eaddce] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MapPin size={20} className="text-[#8e5c3a]" />
            </div>
            <p className="text-[17px] text-[#7a6e5f] italic" style={{ fontFamily: "'Caveat', cursive" }}>Mapear novo cenário...</p>
          </button>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2c2416]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseModal} />

          <div className="relative bg-[#fcfaf7] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl border border-[#b4a078] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#8e5c3a]/20" />

            <div className="p-8 pl-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#2c2416] flex items-center gap-2" style={{ fontFamily: "'Lora', serif" }}>
                    <Map size={20} className="text-[#8e5c3a]" />
                    {editingId ? "Editar Local Mapeado" : "Mapear Novo Local"}
                  </h2>
                </div>
                <button onClick={handleCloseModal} className="p-2 hover:bg-[#8e5c3a]/10 rounded-full text-[#8e5c3a] transition-colors"><X size={20} /></button>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                
                {/* ÁREA DA FOTO (Voltou a ser um input click comum) */}
                <div className="md:col-span-2 flex justify-center mb-2">
                  <div
                    className="relative group cursor-pointer w-full max-w-sm h-32 rounded-lg bg-[#f5f0e8] border-2 border-dashed border-[#b4a078] flex flex-col items-center justify-center text-[#b5a89a] hover:bg-[#eaddce] hover:border-[#8e5c3a] transition-all overflow-hidden shadow-inner"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Cenário" className="w-full h-full object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center w-full h-full justify-center">
                        <Camera size={28} className="mb-2 text-[#b5a89a]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-[#a09586]">Escolher Imagem</span>
                      </div>
                    )}
                    
                    {/* Input nativo invisível */}
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Nome do Local</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Floresta de Prata" className="w-full bg-[#f5f0e8]/60 border border-[#b4a07866] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#8e5c3a] transition-colors" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1 flex items-center gap-1"><MapPin size={12} /> Região / Reino</label>
                  <input type="text" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} placeholder="Aonde fica?" className="w-full bg-[#f5f0e8]/60 border border-[#b4a07866] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#8e5c3a] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1 flex items-center gap-1"><AlertCircle size={12} /> Relevância</label>
                  <select value={formData.importance} onChange={(e) => setFormData({ ...formData, importance: e.target.value })} className="w-full bg-[#f5f0e8]/60 border border-[#b4a07866] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#8e5c3a] transition-colors appearance-none text-sm">
                    <option value="HIGH">Alta (Cenário Principal)</option>
                    <option value="MEDIUM">Média (Recorrente)</option>
                    <option value="LOW">Baixa (Passagem)</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1 flex items-center gap-1"><Cloud size={12} /> Atmosfera & Clima</label>
                  <input type="text" value={formData.atmosphere} onChange={(e) => setFormData({ ...formData, atmosphere: e.target.value })} placeholder="Ex: Nebuloso, cheiro de maresia..." className="w-full bg-[#f5f0e8]/60 border border-[#b4a07866] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#8e5c3a] transition-colors" />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Descrição</label>
                  <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Era um lugar esquecido pelo tempo..." className="w-full bg-[#f5f0e8]/60 border border-[#b4a07866] rounded-xl px-4 py-3 focus:outline-none focus:border-[#8e5c3a] transition-colors resize-none" style={{ fontFamily: "'Lora', serif" }} />
                  <p className="text-[10px] text-[#b5a89a] ml-1">A primeira letra aparecerá destacada no card (Estilo Drop-Cap).</p>
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3 border border-[#b4a078] text-[#8e5c3a] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8e5c3a]/5 transition-colors">Descartar</button>
                  <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 bg-[#2c2416] text-[#f5f0e8] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#4a3e2b] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                    {/* Se estiver fazendo upload OU salvando no banco, mostra o spinner */}
                    {isPending && <Loader2 size={14} className="animate-spin" />}
                    {isUploading ? "Enviando Foto..." : "Salvar Local"}
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
// SUBCOMPONENTE: CARD DO LUGAR
// ==========================================
function PlaceCard({
  place,
  onEdit,
  onDelete,
}: {
  place: Place;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const importanceStyles: Record<string, string> = {
    HIGH: "text-red-600 border-red-200 bg-red-50",
    MEDIUM: "text-amber-600 border-amber-200 bg-amber-50",
    LOW: "text-slate-500 border-slate-200 bg-slate-50",
  };

  return (
    <div
      className="relative bg-[#f3ebd8] rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[4px_8px_20px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-1 group border border-[#e0ddd5] flex flex-col min-h-[260px] overflow-hidden"
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <div className="absolute top-16 -right-4 w-16 h-5 bg-white/40 backdrop-blur-sm rotate-[40deg] shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-10 pointer-events-none" />

      {/* MENU 3 PONTOS */}
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1.5 rounded-full text-[#b5a89a] hover:text-[#2c2416] hover:bg-black/5 transition-colors bg-white/50 backdrop-blur-sm"
        >
          <MoreHorizontal size={18} />
        </button>
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-[#e8e4db] py-1 animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#4a3e2b] hover:bg-[#f5f0e8]"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>

      {place.imageUrl ? (
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-[120px] object-cover border-b border-black/10 shrink-0"
        />
      ) : (
        <div className="w-full h-[120px] bg-[#eaddce] border-b border-[#d5c8b5] flex items-center justify-center shadow-inner shrink-0">
          <MapPin size={28} className="text-[#b5a89a]" />
        </div>
      )}

      {/* WRAPPER DO TEXTO (Aqui entra o Padding que protege o conteúdo) */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4 pr-4">
          <h3
            className="text-[19px] font-bold text-[#2c2416] leading-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {place.name}
          </h3>
          {place.importance && (
            <span
              className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-sm shrink-0 mt-1 ${importanceStyles[place.importance]}`}
            >
              {place.importance}
            </span>
          )}
        </div>

        {(place.region || place.atmosphere) && (
          <div className="mb-3 text-[11px] text-[#7a6e5f] uppercase tracking-widest font-bold flex flex-col gap-1">
            {place.region && (
              <span>
                <MapPin size={10} className="inline mr-1 -mt-0.5" />{" "}
                {place.region}
              </span>
            )}
            {place.atmosphere && (
              <span>
                <Cloud size={10} className="inline mr-1 -mt-0.5" />{" "}
                {place.atmosphere}
              </span>
            )}
          </div>
        )}

        <div
          className="flex-1 text-[#4a3e2b] text-[14px] leading-relaxed relative"
          style={{ fontFamily: "'Lora', serif" }}
        >
          <p className="line-clamp-5 drop-cap-paragraph">
            {place.description || (
              <span className="opacity-50 italic">Sem descrição...</span>
            )}
          </p>
        </div>
      </div>

      <style jsx>{`
        .drop-cap-paragraph::first-letter {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c2416;
          float: left;
          line-height: 0.8;
          margin-right: 0.3rem;
          margin-top: 0.2rem;
          font-family: 'Lora', serif;
        }
      `}</style>
    </div>
  );
}