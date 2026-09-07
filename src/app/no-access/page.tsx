import Link from "next/link";
import { Mark } from "@/components/brand/Mark";

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper-dim px-6 text-center">
      <Mark className="h-8 w-8 text-ink-faint" />
      <div>
        <h1 className="font-serif text-2xl text-ink">No access</h1>
        <p className="mt-1 text-sm text-ink-muted">
          You don&apos;t have permission to view this workspace.
        </p>
      </div>
      <Link href="/" className="btn-secondary">
        Back to start
      </Link>
    </main>
  );
}
