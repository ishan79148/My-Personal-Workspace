import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createWorkspace } from "@/actions/workspace-actions";
import { Mark } from "@/components/brand/Mark";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const workspace = await createWorkspace(name);
    redirect(`/${workspace.id}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper-dim px-6">
      <div className="flex items-center gap-2 text-ink">
        <Mark className="h-6 w-6 text-moss" />
        <span className="text-sm font-semibold tracking-tight">
          NestDocs
        </span>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-line bg-paper p-8 shadow-panel">
        <h1 className="font-serif text-2xl text-ink">
          Create your first workspace
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          This is where your team&apos;s pages will live.
        </p>
        <form action={handleCreate} className="mt-6 flex flex-col gap-3">
          <input
            name="name"
            placeholder="Workspace name"
            className="field"
            required
          />
          <button type="submit" className="btn-primary">
            Create workspace
          </button>
        </form>
      </div>
    </main>
  );
}
