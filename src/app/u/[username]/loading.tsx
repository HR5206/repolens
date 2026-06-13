export default function Loading() {
    return (
        <main className="mx-auto max-w-2xl animate-pulse p-8">
            <div className="flex-items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                    <div className="h-6 w-48 rounded bg-gray-200"></div>
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
            </div>
        </main>
    )
}