"use client";

import type { PageNode } from "@/types/page";
import { PageTreeItem } from "./PageTreeItem";

interface PageTreeProps {
  nodes: PageNode[];
  workspaceId: string;
}

export function PageTree({ nodes, workspaceId }: PageTreeProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <PageTreeItem key={node.id} node={node} workspaceId={workspaceId} />
      ))}
    </ul>
  );
}
