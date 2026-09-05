import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Editor } from "@/components/editor/Editor";

export default async function NotePage({
  params,
}: {
  params: { workspaceId: string; noteId: string };
}) {
  const page = await db.page.findFirst({
    where: { id: params.noteId, workspaceId: params.workspaceId },
  });

  if (!page) notFound();

  const initialText =
    page.content &&
    typeof page.content === "object" &&
    "text" in (page.content as Record<string, unknown>)
      ? String((page.content as { text?: unknown }).text ?? "")
      : "";

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">{page.title}</h1>
      <Editor pageId={page.id} initialContent={initialText} />
    </div>
  );
}
