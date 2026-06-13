import type { LanguageStat } from "@/lib/stats";

export function LanguageBar({ stats }: { stats: LanguageStat[] }) {
    if (stats.length === 0) {
        return (
            <p className="font-mono text-sm uppercase tracking-widest text-white/50">
                [ No language data ]
            </p>
        );
    }

    const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

    return (
        <div className="w-full">
            <div className="flex h-4 w-full border border-white/30 bg-black overflow-hidden">
                {stats.map((s, i) => (
                    <div
                        key={s.language}
                        style={{
                            width: `${s.percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                        }}
                        className="h-full border-r border-black last:border-r-0 hover:brightness-125 transition-all cursor-crosshair"
                        title={`${s.language}: ${s.percentage}%`}
                    />
                ))}
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {stats.map((s, i) => (
                    <li 
                        key={s.language} 
                        className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
                    >
                        <span
                            className="block h-2 w-2"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-white/60">
                            {s.language} <span className="ml-1 font-bold text-white">{s.percentage}%</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}