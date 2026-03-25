import { Mail } from "lucide-react";

export default function InquiriesPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-dvh gap-6 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Inquiries</h1>
                <p className="text-base text-zinc-500 max-w-sm">
                    Manage your supplier inquiries and quotes all in one place. This feature is coming soon.
                </p>
            </div>
        </div>
    );
}
