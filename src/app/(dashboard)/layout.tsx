import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WorkspaceSwitcher } from "@/components/sidebar/WorkspaceSwitcher";

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
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-neutral-100 p-3">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={workspaces[0].id}
        />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
