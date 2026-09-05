import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">NestDocs</h1>
      <p className="text-neutral-500">Nested documents for your team.</p>
      <Link
        href="/login"
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
      >
        Sign in
      </Link>
    </main>
  );
}
