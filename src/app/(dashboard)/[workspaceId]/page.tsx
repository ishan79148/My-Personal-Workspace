import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { buildTree } from "@/lib/build-tree";
import { PageTree } from "@/components/sidebar/PageTree";
import { createPage } from "@/actions/page-actions";

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const pages = await db.page.findMany({
    where: { workspaceId, isArchived: false },
    select: {
      id: true,
      title: true,
      icon: true,
      parentId: true,
      position: true,
      workspaceId: true,
      isArchived: true,
    },
  });

  const tree = buildTree(pages);

  async function handleCreateTopLevelPage() {
    "use server";
    const page = await createPage({ workspaceId });
    redirect(`/${workspaceId}/${page.id}`);
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
      <nav className="w-64 border-r border-line p-3">
        <PageTree nodes={tree} workspaceId={workspaceId} />
        <form action={handleCreateTopLevelPage} className="mt-2">
          <button className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-ink-muted transition hover:bg-paper-dim hover:text-ink">
            <span className="text-base leading-none text-ink-faint">+</span>
            New page
          </button>
        </form>
      </nav>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-serif text-xl text-ink-muted">
            Nothing selected yet
          </p>
          <p className="max-w-xs text-sm text-ink-faint">
            Pick a page from the sidebar, or start a new one to begin
            writing.
          </p>
        </div>
      </main>
    </div>
  );
}
