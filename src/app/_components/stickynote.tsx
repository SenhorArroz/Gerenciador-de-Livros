type NoteColor = "yellow" | "pink" | "green";

const colorMap: Record<NoteColor, string> = {
  yellow: "bg-[#fdf3a7] text-[#3a2e1a]",
  pink:   "bg-[#f5c8e0] text-[#3a1a2e]",
  green:  "bg-[#c8f0d8] text-[#1a3a26]",
};

const rotationMap: Record<NoteColor, string> = {
  yellow: "-rotate-[0.5deg]",
  pink:   "rotate-[0.7deg]",
  green:  "-rotate-[0.3deg]",
};

type StickyNoteProps = {
  content: string;
  color: NoteColor;
};

export default function StickyNote({ content, color }: StickyNoteProps) {
  return (
    
    <div
      className={[
        "px-3 py-4 rounded-sm rounded-tr-xl rounded-br-xl rounded-bl-xl relative",
        "shadow-[2px_2px_6px_rgba(0,0,0,0.08)] hover:rotate-2 duration-100 transition-all",
        colorMap[color],
        rotationMap[color],
      ].join(" ")}
      style={{ fontFamily: "'Caveat', cursive", fontSize: "15px", lineHeight: "1.5" }}
    >
        <div className="absolute -top-3 bg-sky-200/40 rotate-3 w-50 h-7"></div>
        <div className="absolute left-30 -top-5 bg-sky-200/50 -rotate-12 w-20 h-7"></div>

      {/* Top shadow strip */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-black/[0.06] rounded-t" />
      {content}
    </div>
  );
}