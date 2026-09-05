"use client";

import { useState } from "react";
import Link from "next/link";
import type { PageNode } from "@/types/page";

interface PageTreeItemProps {
  node: PageNode;
  workspaceId: string;
}

export function PageTreeItem({ node, workspaceId }: PageTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-neutral-100">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`w-4 text-neutral-400 ${hasChildren ? "" : "invisible"}`}
        >
          {expanded ? "▾" : "▸"}
        </button>
        <Link href={`/${workspaceId}/${node.id}`} className="truncate">
          {node.icon ?? "📄"} {node.title}
        </Link>
      </div>
      {expanded && hasChildren && (
        <ul className="ml-4 flex flex-col gap-0.5 border-l border-neutral-100 pl-2">
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              workspaceId={workspaceId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
