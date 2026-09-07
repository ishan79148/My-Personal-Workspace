import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    const membership = await db.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    });

    if (membership?.workspaceId) {
      redirect(`/${membership.workspaceId}`);
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">NestDocs</h1>
      <p className="text-neutral-500">Nested documents for your team.</p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 transition"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}

