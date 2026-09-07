import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Mark } from "@/components/brand/Mark";

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
    <main className="relative flex min-h-screen items-center overflow-hidden bg-paper px-6">
      {/* Decorative nested frames, echoing the page-tree structure */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 md:block"
      >
        <div className="h-[30rem] w-[30rem] rounded-[3.5rem] border border-line" />
        <div className="absolute left-16 top-16 h-[22rem] w-[22rem] rounded-[3rem] border border-line-strong" />
        <div className="absolute left-32 top-32 h-[14rem] w-[14rem] rounded-[2.5rem] border border-moss/40 bg-moss-light/60" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-16 py-24">
        <div className="flex items-center gap-2 text-ink">
          <Mark className="h-6 w-6 text-moss" />
          <span className="text-sm font-semibold tracking-tight">
            NestDocs
          </span>
        </div>

        <div className="flex max-w-xl flex-col gap-6">
          <h1 className="font-serif text-5xl leading-[1.1] text-ink sm:text-6xl">
            Every idea has a home, and every home has room to grow.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-ink-muted">
            NestDocs is a workspace for teams who think in outlines — pages
            hold pages, ideas branch into detail, and everything you write
            saves itself while you keep going.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href="/register" className="btn-primary">
              Create your workspace
            </Link>
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
          </div>
        </div>

        <dl className="grid max-w-xl grid-cols-3 gap-8 border-t border-line pt-8">
          <div>
            <dt className="font-serif text-2xl text-ink">∞</dt>
            <dd className="mt-1 text-sm text-ink-muted">
              Nested pages, any depth
            </dd>
          </div>
          <div>
            <dt className="font-serif text-2xl text-ink">4</dt>
            <dd className="mt-1 text-sm text-ink-muted">
              Roles, from viewer to owner
            </dd>
          </div>
          <div>
            <dt className="font-serif text-2xl text-ink">0</dt>
            <dd className="mt-1 text-sm text-ink-muted">
              Save buttons you&apos;ll ever click
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
