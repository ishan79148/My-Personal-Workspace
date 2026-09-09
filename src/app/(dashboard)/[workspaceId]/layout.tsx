import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/Header";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await params;
  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
    include: { workspace: true },
  });

  if (!member) redirect("/no-access");

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <Header
        workspaceName={member.workspace.name}
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}

