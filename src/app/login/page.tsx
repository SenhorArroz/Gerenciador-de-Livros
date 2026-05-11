"use client";

import { signIn } from "next-auth/react";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#d6d6d6] flex items-center justify-center p-4 antialiased">
      <div className="bg-[#fdfcfb] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-black/5 relative flex flex-col items-center text-center p-10">
        
        {/* Detalhe da Lombada lateral (Estética) */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#8e5c3a]/20 border-r border-black/5" />
        
        {/* Ícone / Logo */}
        <div className="w-16 h-16 bg-[#f5f0e8] border border-[#d5c8b5] rounded-full flex items-center justify-center text-[#8e5c3a] shadow-inner mb-6 z-10">
          <BookOpen size={28} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-[#2c2416] mb-2 z-10" style={{ fontFamily: "'Lora', serif" }}>
          Sua Biblioteca
        </h1>
        <p className="text-[#7a6e5f] text-lg italic mb-10 z-10" style={{ fontFamily: "'Caveat', cursive" }}>
          Entre para acessar seus manuscritos e universos...
        </p>

        {/* Botão de Login do Google */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/library" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#d1c8b8] text-[#4a3e2b] px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-[#f5f0e8] hover:border-[#b4a078] transition-all shadow-sm active:scale-95 z-10"
        >
          {/* SVG do Logo do Google */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          CONTINUAR COM GOOGLE
        </button>
      </div>
    </div>
  );
}