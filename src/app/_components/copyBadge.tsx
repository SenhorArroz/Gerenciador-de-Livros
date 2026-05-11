"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 px-3 py-1.5 bg-[#f5f0e8] border border-[#d1c8b8] rounded-md hover:bg-[#eaddce] hover:border-[#b4a078] transition-all cursor-pointer shadow-sm"
      title="Copiar código do livro"
    >
      <span className="text-[10px] font-bold text-[#7a6e5f] uppercase tracking-widest">
        Cód:
      </span>
      <span className="text-[13px] font-mono text-[#2c2416] font-semibold bg-white/50 px-1.5 py-0.5 rounded">
        {code}
      </span>
      {copied ? (
        <Check size={14} className="text-green-600" />
      ) : (
        <Copy size={14} className="text-[#a09586] group-hover:text-[#8e5c3a] transition-colors" />
      )}
    </button>
  );
}