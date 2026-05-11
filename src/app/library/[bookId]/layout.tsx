"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import {
  LayoutDashboard,
  Users,
  Map,
  FileText,
  StickyNote,
  Box,
  ArrowLeft,
} from "lucide-react";

// Adicionamos a prop 'base' no array para depois interpolar corretamente o bookId
const tabs = [
  { label: "Visão Geral", icon: LayoutDashboard, href: "/principal", color: "bg-[#e5ddd3]" },
  { label: "Personagens", icon: Users, href: "/personagens", color: "bg-[#d1e1e4]" },
  { label: "Lugares", icon: Map, href: "/locais", color: "bg-[#e2d6c6]" },
  { label: "Capítulos", icon: FileText, href: "/capitulos", color: "bg-[#e9d5d8]" },
  { label: "Anotações", icon: StickyNote, href: "/anotacoes", color: "bg-[#f2ead0]" },
  { label: "Itens", icon: Box, href: "/itens", color: "bg-[#d4e2d9]" },
] as const;

export default function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ bookId: string }>;
}) {
  const pathname = usePathname();
  const { bookId } = use(params); // Desembrulha a Promise
  const base = `/library/${bookId}`;

  return (
    <div className="min-h-screen bg-[#f3eeee] flex items-center justify-center p-4 antialiased">
      <div className="flex w-full max-w-[95%] h-[90vh] items-stretch">
        
        {/* SIDEBAR DE ABAS */}
        <div className="w-[150px] flex flex-col items-end pt-12 z-10">
          {/* Botão Biblioteca - Estilo Aba Inferior */}
          <Link
            href="/library"
            className="flex items-center gap-2 text-[#6b6155] text-xs mb-8 px-4 py-2 bg-[#f3f0e9]/80 rounded-l-lg hover:bg-white transition-all border-y border-l border-black/5 mr-[-1px]"
          >
            <ArrowLeft size={14} />
            BIBLIOTECA
          </Link>

          <div className="flex flex-col gap-1 w-full items-end">
            {tabs.map((tab) => {
              // Constrói a URL completa injetando a variável do ID do livro
              const fullHref = `${base}${tab.href}`;
              
              // Verifica a rota baseada na URL construída
              const isActive = pathname.includes(tab.href);
              const Icon = tab.icon;

              return (
                <div key={tab.label} className="relative flex items-center justify-end w-full">
                  {/* Anel do fichário */}
                  <div className="absolute right-[-8px] w-5 h-2 bg-[#b5b5b5] rounded-full z-30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] border-t border-white/20" />
                  
                  <Link
                    href={fullHref}
                    className={`
                      flex items-center gap-3 px-4 py-4 w-[140px]
                      rounded-l-2xl transition-all duration-300 border-y border-l border-black/10
                      ${tab.color} 
                      ${isActive 
                        ? 'mr-[-1px] shadow-[-6px_2px_12px_rgba(0,0,0,0.1)] z-20 w-[145px]' 
                        : 'opacity-90 hover:w-[145px] z-0'}
                    `}
                  >
                    <Icon size={18} className="text-[#5a5a5a] shrink-0" />
                    <span className="text-[#4a4a4a] text-[11px] font-bold tracking-widest uppercase truncate">
                      {tab.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOLHA DO FICHÁRIO */}
        <div className="flex-1 bg-[#fdfcfb] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col z-20 border border-black/5">
            
          {/* Decoração da borda esquerda (Sombra interna) */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />


          {/* Furos Extras Decorativos */}
          <div className="absolute left-2 top-0 bottom-0 w-4 flex flex-col justify-around py-12 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-black/10 rounded-full" />
            ))}
          </div>

          {/* Área de Conteúdo principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-10 md:p-10 h-full">
               {children}
            </div>
          </div>
        </div>
        
      </div>

      <style jsx global>{`
        /* Scrollbar discreta para manter o visual de papel */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d1d1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}