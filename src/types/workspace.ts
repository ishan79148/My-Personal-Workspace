// types/workspace.ts
import type { WorkspaceRole } from "@prisma/client";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
}
