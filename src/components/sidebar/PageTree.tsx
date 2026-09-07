"use client";

import type { PageNode } from "@/types/page";
import { PageTreeItem } from "./PageTreeItem";

interface PageTreeProps {
  nodes: PageNode[];
  workspaceId: string;
}

export function PageTree({ nodes, workspaceId }: PageTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="px-2 py-1.5 text-xs text-ink-faint">
        No pages yet — create your first one below.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <PageTreeItem key={node.id} node={node} workspaceId={workspaceId} />
      ))}
    </ul>
  );
}
