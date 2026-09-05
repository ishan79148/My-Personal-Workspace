"use client";

import type { WorkspaceSummary } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: WorkspaceSwitcherProps) {
  return (
    <select
      className="w-full rounded border border-neutral-200 px-2 py-1 text-sm"
      defaultValue={activeWorkspaceId}
      onChange={(e) => {
        window.location.href = `/${e.target.value}`;
      }}
    >
      {workspaces.map((ws) => (
        <option key={ws.id} value={ws.id}>
          {ws.name}
        </option>
      ))}
    </select>
  );
}
