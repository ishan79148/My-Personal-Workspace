"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PageNode } from "@/types/page";

interface PageTreeItemProps {
  node: PageNode;
  workspaceId: string;
}

export function PageTreeItem({ node, workspaceId }: PageTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const hasChildren = node.children.length > 0;
  const href = `/${workspaceId}/${node.id}`;
  const isActive = pathname === href;

  return (
    <li>
      <div
        className={`group flex items-center gap-1 rounded-md px-1.5 py-1 text-sm transition ${
          isActive
            ? "bg-moss-light text-moss-dark"
            : "text-ink hover:bg-paper-dim"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center text-ink-faint transition ${
            hasChildren ? "" : "invisible"
          }`}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className={`h-3.5 w-3.5 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          >
            <path
              d="M7.5 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Link href={href} className="flex-1 truncate">
          <span className="mr-1.5">{node.icon ?? "📄"}</span>
          {node.title}
        </Link>
      </div>
      {expanded && hasChildren && (
        <ul className="ml-3 flex flex-col gap-0.5 border-l border-line pl-2">
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
