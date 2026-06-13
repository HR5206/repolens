import type { DayActivity } from "@/lib/stats";

function intensity(count: number): string {
    if (count === 0) return 'transparent'; 
    if (count <= 2) return "#0e4429";
    if (count <= 5) return "#006d32";
    if (count <= 10) return "#26a641";
    return "#39d353";
}

export function HeatMap({ days }: { days: DayActivity[] }) {
    return (
        <div className="w-full">
            
            <div className="overflow-x-auto pb-4">
                <div className="grid grid-flow-col grid-rows-7 gap-[2px] min-w-max">
                    {days.map((day) => {
                        const bg = intensity(day.count);
                        const isEmpty = day.count === 0;
                        
                        return (
                            <div 
                                key={day.date}
                                className={`
                                    h-3 w-3 sm:h-4 sm:w-4 rounded-none transition-all duration-200 cursor-crosshair
                                    ${isEmpty ? 'border border-white/10' : 'border border-transparent hover:border-white'}
                                `}
                                style={{ backgroundColor: bg }}
                                title={`${day.date} // ${day.count} EVENTS`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
                <span> Less </span>
                <div className="flex gap-[2px]">
                    {[0, 2, 5, 10, 15].map((val) => (
                        <div 
                            key={val} 
                            className={`h-3 w-3 sm:h-4 sm:w-4 rounded-none ${val === 0 ? 'border border-white/10 bg-transparent' : ''}`}
                            style={{ backgroundColor: val > 0 ? intensity(val) : undefined }}
                        />
                    ))}
                </div>
                <span> More </span>
            </div>
        </div>
    );
}