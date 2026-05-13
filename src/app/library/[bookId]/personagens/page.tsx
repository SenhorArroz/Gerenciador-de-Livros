"use client";

import {
    Users,
    Search,
    Plus,
    User as UserIcon,
    X,
    Camera,
    Feather,
    Check,
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    Minus,
    Box,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useUploadThing } from "~/utils/uploadthing";

const CATEGORY_OPTIONS = [
    "Curioso",
    "Cético",
    "Marcado por cicatrizes",
    "Estrategista",
    "Impulsivo",
    "Leal",
];

type Character = {
    id: string;
    name: string;
    role: string;
    age: string | null;
    category: string | null;
    description: string | null;
    inventory: string | null;
    imageUrl: string | null;
    bookId: string;
};

const encodeInventory = (items: { name: string; desc: string }[]) => {
    return items
        .filter((i) => i.name.trim() !== "")
        .map((i) => `(nome: ${i.name}\ndescrição: ${i.desc})`)
        .join("\n\n");
};

const decodeInventory = (text: string | null) => {
    if (!text) return [];
    return text.split("\n\n").map((block) => {
        const nameMatch = block.match(/\(nome:\s*(.*?)\n/);
        const descMatch = block.match(/descrição:\s*(.*?)\)/);
        if (nameMatch) {
            return {
                name: nameMatch[1] || "",
                desc: descMatch ? descMatch[1] || "" : "",
            };
        }
        return {
            name: block.replace(/^[-*]\s*/, "") || "",
            desc: "",
        };
    });
};

export default function CharactersPage() {
    const params = useParams<{ bookId: string }>();
    const bookId = params.bookId;
    const utils = api.useUtils();

    const [formData, setFormData] = useState({ name: "", role: "", age: "", notes: "" });
    const [inventoryFields, setInventoryFields] = useState<{ name: string; desc: string }[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload, isUploading } = useUploadThing("imageUploader");

    const { data: characters, isLoading } = api.character.getByBookId.useQuery({ bookId });
    const { data: globalItems } = api.item.getByBookId.useQuery({ bookId });

    const createCharacter = api.character.create.useMutation({
        onSuccess: () => { utils.character.getByBookId.invalidate(); handleCloseModal(); },
    });

    const updateCharacter = api.character.update.useMutation({
        onSuccess: () => { utils.character.getByBookId.invalidate(); handleCloseModal(); },
    });

    const deleteCharacter = api.character.delete.useMutation({
        onSuccess: () => { utils.character.getByBookId.invalidate(); },
    });

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setFormData({ name: "", role: "", age: "", notes: "" });
        setInventoryFields([]);
        setSelectedCategories([]);
        setPhotoPreview(null);
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (char: Character) => {
        setEditingId(char.id);
        setFormData({
            name: char.name,
            role: char.role,
            age: char.age || "",
            notes: char.description || "",
        });
        setInventoryFields(decodeInventory(char.inventory));
        setSelectedCategories(char.category ? char.category.split(", ") : []);
        setPhotoPreview(char.imageUrl);
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setEditingId(null);
            setPhotoPreview(null);
            setSelectedFile(null);
            setSelectedCategories([]);
            setFormData({ name: "", role: "", age: "", notes: "" });
            setInventoryFields([]);
        }, 300);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.role.trim()) return;
        let finalImageUrl = photoPreview;
        if (selectedFile) {
            const uploadedFiles = await startUpload([selectedFile]);
            if (uploadedFiles && uploadedFiles[0]) {
                finalImageUrl = uploadedFiles[0].url;
            } else {
                alert("Falha no upload da imagem. Tente novamente.");
                return;
            }
        }

        const payload = {
            bookId,
            name: formData.name,
            role: formData.role,
            age: formData.age || undefined,
            inventory: encodeInventory(inventoryFields) || undefined,
            description: formData.notes || undefined,
            category: selectedCategories.join(", ") || undefined,
            imageUrl: finalImageUrl || undefined,
        };

        if (editingId) {
            updateCharacter.mutate({ id: editingId, ...payload });
        } else {
            createCharacter.mutate(payload);
        }
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
        );
    };

    const addInventoryField = () => setInventoryFields([...inventoryFields, { name: "", desc: "" }]);
    const removeInventoryField = (index: number) => setInventoryFields(inventoryFields.filter((_, i) => i !== index));
    const updateInventoryField = (index: number, field: "name" | "desc", value: string) => {
        const newFields = [...inventoryFields];
        if (newFields[index]) {
            newFields[index][field] = value;
            setInventoryFields(newFields);
        }
    };

    const isPending = createCharacter.isPending || updateCharacter.isPending || isUploading;

    const filteredCharacters = characters?.filter(
        (char) =>
            char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            char.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="p-2 md:p-4 relative h-full flex flex-col overflow-hidden">
            {/* Header Responsivo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-1 gap-4">
                <h1 className="text-[26px] md:text-[30px] font-semibold text-[#2c2416] leading-tight" style={{ fontFamily: "'Lora', serif" }}>
                    Personagens
                </h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-[#2c2416] text-[#f5f0e8] rounded-lg text-[12px] font-medium uppercase tracking-widest hover:bg-[#4a3e2b] transition-all shadow-sm active:scale-95 shrink-0"
                >
                    <Plus size={14} /> Novo Personagem
                </button>
            </div>

            <div className="h-px bg-[#8e5c3a] opacity-30 my-2" />

            <p className="text-[14px] md:text-[15px] text-[#7a6e5f] italic mb-6 md:mb-8" style={{ fontFamily: "'Caveat', cursive" }}>
                "As vozes, rostos e almas que habitam este universo..."
            </p>

            <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5a89a]" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou papel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f5f0e8]/50 border border-[#b4a07866] rounded-xl text-[14px] text-[#2c2416] focus:outline-none focus:border-[#8e5c3a] transition-colors shadow-inner"
                        style={{ fontFamily: "'Lora', serif" }}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="animate-spin text-[#8e5c3a]" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 overflow-y-auto pb-10 pr-1 md:pr-2 items-start custom-scrollbar">
                    {filteredCharacters?.map((character) => {
                        const characterGlobalItems = globalItems?.filter((item) => item.relatedTo === character.name) || [];
                        return (
                            <CharacterCard
                                key={character.id}
                                character={character}
                                globalItems={characterGlobalItems}
                                onEdit={() => handleOpenEditModal(character)}
                                onDelete={() => deleteCharacter.mutate({ id: character.id })}
                            />
                        );
                    })}

                    <button
                        onClick={handleOpenCreateModal}
                        className="group flex flex-col items-center justify-center min-h-[300px] md:h-[400px] bg-[#f5f0e8]/30 border-2 border-dashed border-[#b4a07866] rounded-sm hover:bg-[#f5f0e8]/80 hover:border-[#8e5c3a]/50 transition-all cursor-pointer p-6"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#eaddce] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus size={20} className="text-[#8e5c3a]" />
                        </div>
                        <p className="text-[17px] text-[#7a6e5f] italic" style={{ fontFamily: "'Caveat', cursive" }}>
                            Criar nova ficha...
                        </p>
                    </button>
                </div>
            )}

            {/* MODAL RESPONSIVO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-[#2c2416]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseModal} />
                    <div className="relative bg-[#fcfaf7] w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto custom-scrollbar sm:rounded-xl border border-[#b4a078] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-3 bg-[#8e5c3a]/20" />
                        <div className="p-5 md:p-8 md:pl-10">
                            <div className="flex justify-between items-start mb-6 sticky top-0 bg-[#fcfaf7] z-10 py-2">
                                <h2 className="text-xl md:text-2xl font-semibold text-[#2c2416] flex items-center gap-2" style={{ fontFamily: "'Lora', serif" }}>
                                    <Feather size={20} className="text-[#8e5c3a]" />
                                    {editingId ? "Editar Personagem" : "Nova Ficha"}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-[#8e5c3a]/10 rounded-full text-[#8e5c3a] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-24 sm:pb-0" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                {/* FOTO E DADOS BÁSICOS */}
                                <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 mb-2">
                                    <div
                                        className="relative group cursor-pointer w-24 h-24 md:w-28 md:h-28 shrink-0 mx-auto sm:mx-0 bg-[#f5f0e8] border border-[#b4a078] shadow-inner flex flex-col items-center justify-center text-[#b5a89a] hover:bg-[#eaddce] transition-all overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {photoPreview ? (
                                            <>
                                                <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera size={20} className="text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Camera size={24} className="mb-1" />
                                                <span className="text-[10px] font-bold uppercase">Foto</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Nome Completo</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-11 bg-white border border-[#d1c8b8] rounded-md px-4 focus:outline-none focus:border-[#8e5c3a]"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="space-y-1 flex-1">
                                                <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Papel</label>
                                                <input
                                                    type="text"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    placeholder="Ex: Protagonista"
                                                    className="w-full h-11 bg-white border border-[#d1c8b8] rounded-md px-4 focus:outline-none"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1 w-20 md:w-24">
                                                <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Idade</label>
                                                <input
                                                    type="text"
                                                    value={formData.age}
                                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                    className="w-full h-11 bg-white border border-[#d1c8b8] rounded-md px-4 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TRAÇOS */}
                                <div className="md:col-span-2 space-y-2 mt-2">
                                    <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Características</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-white border border-[#d1c8b8] rounded-md">
                                        {CATEGORY_OPTIONS.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md text-[13px] font-medium transition-all ${selectedCategories.includes(cat) ? "bg-[#d4d1cc] text-[#2c2416]" : "bg-[#f5f0e8] text-[#7a6e5f]"}`}
                                            >
                                                {selectedCategories.includes(cat) && <Check size={12} />} {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* INVENTÁRIO */}
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex justify-between items-center border-b border-[#e8e4db] pb-1">
                                        <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Inventário</label>
                                        <button type="button" onClick={addInventoryField} className="text-[#8e5c3a] hover:bg-[#8e5c3a]/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            <Plus size={12} /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {inventoryFields.map((field, index) => (
                                            <div key={index} className="flex gap-2 items-start bg-black/5 p-3 rounded-md border border-black/5">
                                                <div className="flex-1 space-y-2">
                                                    <input type="text" placeholder="Nome" value={field.name} onChange={(e) => updateInventoryField(index, "name", e.target.value)} className="w-full text-sm bg-transparent border-b border-[#d1c8b8] py-1" />
                                                    <input type="text" placeholder="Descrição" value={field.desc} onChange={(e) => updateInventoryField(index, "desc", e.target.value)} className="w-full text-xs text-[#7a6e5f] bg-transparent" />
                                                </div>
                                                <button type="button" onClick={() => removeInventoryField(index)} className="mt-1 p-1.5 text-red-400"><Minus size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-widest ml-1">Notas</label>
                                    <textarea
                                        rows={4}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-white border border-[#d1c8b8] rounded-md px-4 py-3 focus:outline-none resize-none italic text-[16px]"
                                        style={{ fontFamily: "'Caveat', cursive" }}
                                    />
                                </div>

                                {/* BOTÕES FIXOS NO MOBILE */}
                                <div className="md:col-span-2 fixed sm:relative bottom-0 left-0 right-0 p-4 sm:p-0 bg-[#fcfaf7] sm:bg-transparent border-t sm:border-0 flex gap-3 z-20">
                                    <button type="button" onClick={handleCloseModal} className="flex-1 h-12 sm:h-11 border border-[#d1c8b8] text-[#7a6e5f] rounded-lg text-xs font-bold uppercase tracking-widest">Cancelar</button>
                                    <button type="submit" disabled={isPending} className="flex-[2] sm:flex-1 h-12 sm:h-11 bg-[#2c2416] text-[#f5f0e8] rounded-lg text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2">
                                        {isPending && <Loader2 size={14} className="animate-spin" />}
                                        {isUploading ? "Enviando..." : "Guardar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1c8b8; border-radius: 10px; }
                .lined-paper-section {
                    background-image: repeating-linear-gradient(transparent, transparent 27px, #e8e4db 27px, #e8e4db 28px);
                    background-position: 0 4px;
                }
            `}</style>
        </div>
    );
}

function CharacterCard({ character, globalItems, onEdit, onDelete }: { character: Character; globalItems: any[]; onEdit: () => void; onDelete: () => void; }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const traits = character.category ? character.category.split(", ") : [];
    const inventoryItems = decodeInventory(character.inventory);

    return (
        <div className="relative bg-[#fcfaf7] p-6 md:p-8 rounded-sm shadow-md border border-[#e8e4db] hover:shadow-xl transition-all group flex flex-col h-full" onMouseLeave={() => setIsMenuOpen(false)}>
            <div className="absolute top-4 right-4 z-20">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 rounded-full text-[#b5a89a] hover:text-[#2c2416] hover:bg-black/5 transition-colors">
                    <MoreHorizontal size={18} />
                </button>
                {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-[#e8e4db] py-1 z-30 animate-in fade-in zoom-in-95">
                        <button onClick={() => { setIsMenuOpen(false); onEdit(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#4a3e2b] hover:bg-[#f5f0e8]"><Pencil size={14} /> Editar</button>
                        <button onClick={() => { setIsMenuOpen(false); onDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} /> Excluir</button>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 mb-6 items-center">
                <div className="relative w-24 h-24 sm:w-full sm:h-[110px]">
                    <div className="hidden sm:block absolute -top-3 left-8 w-14 h-5 bg-white/70 rotate-[8deg] shadow-sm backdrop-blur-[2px] z-10" />
                    <div className="w-full h-full bg-[#111] border border-black/10 shadow-sm flex items-center justify-center overflow-hidden">
                        {character.imageUrl ? <img src={character.imageUrl} className="w-full h-full object-cover" alt={character.name} /> : <UserIcon size={32} className="text-white/30" />}
                    </div>
                </div>

                <div className="text-center sm:text-left sm:col-span-2 flex flex-col justify-end pt-2">
                    <h3 className="text-[20px] md:text-[22px] font-bold text-[#2c2416] leading-tight" style={{ fontFamily: "'Lora', serif" }}>{character.name}</h3>
                    <p className="text-[10px] font-bold text-[#7a6e5f] uppercase tracking-[0.25em] mt-1.5">{character.role}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
                        {traits.map((trait, index) => (
                            <span key={index} className="px-2.5 py-0.5 bg-[#e8e4db]/80 text-[#5a5a5a] rounded-md text-[12px]" style={{ fontFamily: "'Caveat', cursive" }}>{trait}</span>
                        ))}
                    </div>
                </div>
            </div>

            {(inventoryItems.length > 0 || globalItems.length > 0) && (
                <div className="mb-6 flex-1">
                    <h4 className="text-[10px] font-bold text-[#b5a89a] uppercase tracking-[0.15em] border-b border-[#e8e4db] pb-1.5 mb-2">Inventário</h4>
                    <ul className="lined-paper-section pl-6 m-0 min-h-[56px] pb-1">
                        {globalItems.map((item) => (
                            <li key={item.id} className="text-[17px] text-[#2c2416] list-disc marker:text-[#8e5c3a] font-bold" style={{ fontFamily: "'Caveat', cursive", lineHeight: "28px" }}>
                                <span className="flex items-center gap-1.5"><Box size={12} className="text-[#8e5c3a] -ml-5 absolute bg-[#fcfaf7]" />{item.name} <span className="text-[14px] text-[#b5a89a] font-normal ml-1">({item.category})</span></span>
                            </li>
                        ))}
                        {inventoryItems.map((item, idx) => (
                            <li key={idx} className="text-[16px] text-[#4a3e2b] list-disc marker:text-[#8e5c3a]" style={{ fontFamily: "'Caveat', cursive", lineHeight: "28px" }}>
                                <span className="font-bold">{item.name}</span> {item.desc && <span className="text-[14px] text-[#7a6e5f] ml-2">- {item.desc}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {character.description && (
                <div className="mt-auto">
                    <h4 className="text-[11px] font-bold text-[#b5a89a] uppercase tracking-[0.15em] border-b border-[#e8e4db] pb-1.5 mb-2">Notas</h4>
                    <div className="lined-paper-section text-[16px] text-[#4a3e2b] pb-2 line-clamp-3 overflow-hidden" style={{ fontFamily: "'Caveat', cursive", lineHeight: "28px" }}>
                        {character.description}
                    </div>
                </div>
            )}
        </div>
    );
}