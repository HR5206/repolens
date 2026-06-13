import type { DayActivity } from "@/lib/stats";

function intensity(count: number): string {
    if (count === 0) return '#e5e7eb';
    if (count <= 2) return "#b2f2bb";
    if (count <= 5) return "#4ade80";
    if (count <= 10) return "#16a34a";
    return "#14532d";
}

export function HeatMap({ days }: { days: DayActivity[]}) {
    return (
        <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Activity (last 90 days)</h2>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
                {days.map((day) => (
                    <div 
                        key={day.date}
                        className="h-3.5 w-3.5 rounded-sm"
                        style={{ backgroundColor: intensity(day.count)}}
                        title={`${day.date}: ${day.count} events`}
                    />
                ))}
            </div>
        </div>
    );
}