import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
};

export default function StatCard({ label, value, icon: Icon, iconColor = "text-[#7a6e5f]" }: StatCardProps) {
  return (
    <div className="bg-[#f5f0e8] border border-[#b4a07866] rounded-xl p-4 text-center group hover:-translate-y-0.5 transition-transform cursor-default">
      <p className="text-[10px] font-medium text-[#b5a89a] uppercase tracking-[0.08em] mb-1">
        {label}
      </p>
      <p
        className="text-[26px] font-semibold text-[#2c2416] leading-none mb-2"
        style={{ fontFamily: "'Lora', serif" }}
      >
        {value}
      </p>
      <Icon size={22} className={iconColor} strokeWidth={1.5} />
    </div>
  );
}