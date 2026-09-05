// types/page.ts
export interface FlatPage {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  position: number;
  workspaceId: string;
  isArchived: boolean;
}

export interface PageNode extends FlatPage {
  children: PageNode[];
}
