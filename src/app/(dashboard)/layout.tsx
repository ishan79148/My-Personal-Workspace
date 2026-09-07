import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WorkspaceSwitcher } from "@/components/sidebar/WorkspaceSwitcher";
import { UserNav } from "@/components/sidebar/UserNav";
import { Mark } from "@/components/brand/Mark";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await db.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
  }));

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 flex-col justify-between border-r border-line bg-paper-dim/60 p-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1 pt-1 text-ink">
            <Mark className="h-5 w-5 text-moss" />
            <span className="text-sm font-semibold tracking-tight">
              NestDocs
            </span>
          </div>
          <div>
            <label className="mb-1.5 block px-1 text-xs font-medium text-ink-faint">
              Workspace
            </label>
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeWorkspaceId={workspaces[0].id}
            />
          </div>
        </div>
        <UserNav email={session.user.email} name={session.user.name} />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
