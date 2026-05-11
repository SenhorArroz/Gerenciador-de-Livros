import { Users, Map, Plus, FileText, Box, Feather, Pin, BookOpen, Quote } from "lucide-react";
import StatCard from "../../../_components/statCard";
import StickyNote from "../../../_components/stickynote";
import CopyBadge from "../../../_components/copyBadge"; // O nosso micro-componente de copiar
import { api } from "~/trpc/server"; 
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BookOverviewPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  // Desempacota os parâmetros de forma assíncrona (Next.js 15+)
  const { bookId } = await params;
  
  // Busca os dados do livro no banco
  const book = await api.book.getById({ id: bookId });

  if (!book) {
    notFound();
  }

  // Monta as contagens reais
  const stats = [
    { label: "Personagens", value: book._count.characters, icon: Users,    iconColor: "text-rose-600" },
    { label: "Lugares",     value: book._count.places,     icon: Map,      iconColor: "text-orange-600" },
    { label: "Capítulos",   value: book._count.chapters,   icon: FileText, iconColor: "text-emerald-600" },
    { label: "Itens",       value: book._count.items,      icon: Box,      iconColor: "text-blue-600" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-full flex flex-col">
      
      {/* ==================================================== */}
      {/* CABEÇALHO (Estilo Folha de Rosto)                    */}
      {/* ==================================================== */}
      <div className="text-center mb-10 relative">
        {/* Ícone decorativo de fundo */}
        <div className="absolute left-1/2 -top-4 -translate-x-1/2 opacity-5 pointer-events-none">
          <BookOpen size={120} />
        </div>

        <h1
          className="text-[38px] md:text-[46px] font-bold text-[#2c2416] leading-tight mb-4 relative z-10"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {book.title}
        </h1>

        {/* Badge para copiar o código do livro */}
        <div className="flex justify-center mb-5 relative z-10">
          <CopyBadge code={book.inviteCode} />
        </div>

        {/* Enfeites do divisor */}
        <div className="flex items-center justify-center gap-4 mb-6 relative z-10">
          <div className="h-[2px] w-16 bg-[#b4a078] opacity-50" />
          <div className="w-2 h-2 rotate-45 bg-[#8e5c3a]" />
          <div className="h-[2px] w-16 bg-[#b4a078] opacity-50" />
        </div>

        <div className="flex justify-center items-start gap-2 max-w-2xl mx-auto relative z-10">
          <Quote size={20} className="text-[#b4a078] shrink-0 mt-1 rotate-180 opacity-60" />
          <p
            className="text-[18px] text-[#7a6e5f] leading-relaxed"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            {book.description}
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ESTATÍSTICAS                                         */}
      {/* ==================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ==================================================== */}
      {/* CORPO PRINCIPAL (Layout Dividido)                    */}
      {/* ==================================================== */}
      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1 pb-8">
        
        {/* LADO ESQUERDO: Manuscrito / Resumo da Trama */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-4 pl-1">
            <Feather size={16} className="text-[#8e5c3a]" />
            <h2 className="text-[12px] font-bold text-[#7a6e5f] uppercase tracking-[0.2em]">
              Manuscrito Central
            </h2>
          </div>
          
          <div className="bg-[#fcfaf7] border border-[#e8e4db] shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-sm p-8 md:p-10 min-h-[300px] relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[#e8e4db] shadow-[-1px_0_0_rgba(255,255,255,1)]" />
            
            {book.plotSummary ? (
              <div className="pl-6 lined-paper-summary">
                {book.plotSummary.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className={`text-[16px] text-[#2c2416] leading-[32px] ${i === 0 ? "drop-cap" : "mt-6"}`}
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 py-10 pl-6">
                <Feather size={40} className="mb-4" />
                <p className="text-[20px]" style={{ fontFamily: "'Caveat', cursive" }}>
                  A página está em branco. Comece a traçar o destino desta obra...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: Painel de Cortiça / Lembretes */}
        <div className="w-full lg:w-[280px] shrink-0">
          <div className="flex items-center justify-between mb-4 pr-1">
            <div className="flex items-center gap-2">
              <Pin size={16} className="text-[#8e5c3a]" />
              <h2 className="text-[12px] font-bold text-[#7a6e5f] uppercase tracking-[0.2em]">
                Painel de Ideias
              </h2>
            </div>
          </div>

          <div className="bg-[#f5f0e8]/50 border-2 border-dashed border-[#d1c8b8] rounded-xl p-5 flex flex-col gap-6 relative">
            
            {/* Lembretes vindos do banco de dados */}
            {book.notes.length > 0 ? (
              book.notes.map((note) => (
                <div key={note.id} className="relative">
                  <div className="absolute inset-0 shadow-[4px_6px_15px_rgba(0,0,0,0.08)] rounded-sm" />
                  <StickyNote 
                    content={note.description} 
                    color={note.color as "yellow" | "pink" | "green"} 
                  />
                </div>
              ))
            ) : (
              <p className="text-[16px] text-[#a09586] italic text-center py-6" style={{ fontFamily: "'Caveat', cursive" }}>
                O painel está vazio.
              </p>
            )}

            <Link 
              href={`/library/${book.id}/anotacoes`}
              className="flex items-center justify-center gap-2 border border-[#d1c8b8] bg-white/50 rounded-lg py-3 text-[14px] text-[#8e5c3a] font-bold tracking-wider uppercase hover:bg-white hover:shadow-sm transition-all"
            >
              <Plus size={16} /> Abrir Quadro
            </Link>
          </div>
        </div>
      </div>

      {/* ESTILOS NATIVOS PARA SERVER COMPONENTS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .lined-paper-summary {
            background-image: repeating-linear-gradient(transparent, transparent 31px, #f0eee9 31px, #f0eee9 32px);
            background-position: 0 4px;
          }

          .drop-cap::first-letter {
            font-size: 3.5rem;
            font-weight: 700;
            color: #8e5c3a;
            float: left;
            line-height: 0.8;
            margin-right: 0.4rem;
            margin-top: 0.4rem;
            font-family: 'Lora', serif;
            text-shadow: 1px 1px 0px rgba(0,0,0,0.1);
          }
        `
      }} />
    </div>
  );
}