import { Heart } from "lucide-react";

export default function MyListsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-dvh gap-6 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
                <Heart className="h-8 w-8 text-rose-400" />
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Lists</h1>
                <p className="text-base text-zinc-500 max-w-sm">
                    Save and organize your favorite products and suppliers. This feature is coming soon.
                </p>
            </div>
        </div>
    );
}
