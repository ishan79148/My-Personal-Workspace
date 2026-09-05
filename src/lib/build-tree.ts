// lib/build-tree.ts
import type { FlatPage, PageNode } from "@/types/page";

export function buildTree(
  pages: FlatPage[],
  parentId: string | null = null
): PageNode[] {
  return pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ ...p, children: buildTree(pages, p.id) }));
}
