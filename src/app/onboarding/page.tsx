import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createWorkspace } from "@/actions/workspace-actions";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Create your first workspace</h1>
      <form action={handleCreate} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="Workspace name"
          className="rounded border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          className="rounded bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          Create workspace
        </button>
      </form>
    </main>
  );
}
