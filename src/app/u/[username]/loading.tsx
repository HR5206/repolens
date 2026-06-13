export default function Loading() {
    return (
        <main className="min-h-screen bg-black text-white p-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-10 h-4 w-24 bg-white/10 animate-pulse"></div>
                <div className="flex items-center gap-6 border-b border-white/30 pb-8">
                    <div className="h-20 w-20 shrink-0 rounded-full border-2 border-white/30 bg-white/10 animate-pulse"></div>
                    <div className="space-y-3 w-full">
                        <div className="h-8 w-48 sm:w-64 bg-white/20 animate-pulse rounded-none"></div>
                        <div className="h-4 w-32 bg-white/10 animate-pulse rounded-none"></div>
                    </div>
                </div>
                <div className="mt-20 flex justify-center">
                    <span className="font-mono text-sm uppercase tracking-widest text-white/50 animate-pulse">
                        FETCHING LOGS...
                    </span>
                </div>
            </div>
        </main>
    );
}