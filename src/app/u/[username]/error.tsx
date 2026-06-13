"use client";

export default function ErrorPage({
    error, reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <main className="mx-auto max-w-2xl p-8 text-center">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-gray-500">{error.message}</p>
            <button
                onClick={reset}
                className="mt-4 rounded bg-black px-4 py-2 text-white"
            >
                Try again
            </button>
        </main>
    )
}