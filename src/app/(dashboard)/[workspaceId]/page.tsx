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
    <div className="flex">
      <nav className="w-64 border-r border-neutral-100 p-3">
        <PageTree nodes={tree} workspaceId={workspaceId} />
        <form action={handleCreateTopLevelPage} className="mt-3">
          <button className="text-sm text-neutral-400 hover:text-neutral-700">
            + New page
          </button>
        </form>
      </nav>
      <main className="flex-1 p-6">
        <h1 className="text-lg font-medium text-neutral-400">
          Select a page from the sidebar, or create a new one.
        </h1>
      </main>
    </div>
  );
}
