import type { LanguageStat } from "@/lib/stats";

export function LanguageBar({ stats } : {stats: LanguageStat[] }) {
    if (stats.length == 0) {
        return <p className="text-sm text-gray-500">No language data.</p>;
    }
    const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];
    return (
        <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Languages</h2>
            <div className="flex h-3 overflow-hidden rounded-full">
                {stats.map((s, i) => (
                    <div 
                        key={s.language}
                        style={{ 
                            width: `${s.percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                        }}
                        title={`${s.language}: ${s.percentage}%`}> </div>
                ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {stats.map((s) => (
                    <li key={s.language} className="text-gray-600">
                        {s.language} <span className="font-medium">{s.percentage}%</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}